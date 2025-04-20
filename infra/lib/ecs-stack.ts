import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

interface EcsStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    backendSecurityGroup: ec2.SecurityGroup;
    backendTaskSecurityGroup: ec2.SecurityGroup;
    ecrRepository: ecr.Repository;
    domainName: string; // ドメイン名を受け取る
    hostedZoneId: string; // ホストゾーンIDを受け取る
}

export class EcsStack extends cdk.Stack {
    public readonly cluster: ecs.Cluster;
    public readonly backendService: ecs.FargateService;
    public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
    public readonly database: rds.DatabaseInstance;
    public readonly apiCertificate: acm.Certificate; // 証明書を外部から参照できるようにする

    constructor(scope: Construct, id: string, props: EcsStackProps) {
        super(scope, id, props);

        // ホストゾーンの取得
        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'ApiHostedZone', {
            hostedZoneId: props.hostedZoneId,
            zoneName: props.domainName,
        });

        // API用の証明書をこのスタック内で作成
        this.apiCertificate = new acm.Certificate(this, 'ApiCertificate', {
            domainName: `api.${props.domainName}`,
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });

        // SSM Parameter に証明書のARNを保存
        new ssm.StringParameter(this, 'ApiCertificateArn', {
            parameterName: `/visionaryfuture/${process.env.ENV || 'dev'}/api-certificate-arn`,
            stringValue: this.apiCertificate.certificateArn,
        });

        // RDS用のセキュリティグループを作成
        const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
            vpc: props.vpc,
            description: 'Security Group for RDS Database',
            allowAllOutbound: true,
        });

        // バックエンドタスクからのみアクセスを許可
        dbSecurityGroup.addIngressRule(
            props.backendTaskSecurityGroup,
            ec2.Port.tcp(5432),
            'Allow access from backend tasks'
        );

        // RDSインスタンスのパラメータグループ（PostgreSQL 17.4用）
        const dbParameterGroup = new rds.ParameterGroup(this, 'DBParameterGroup', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_17_4,
            }),
            parameters: {
                'max_connections': '100',
                'shared_buffers': '16384', // 16MBをキロバイト単位で表記（16 * 1024）
            },
        });

        // RDSインスタンスの作成
        this.database = new rds.DatabaseInstance(this, 'Database', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_17_4,  // 2025年に対応する最新バージョン
            }),
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T4G,  // ARM ベースの最新世代
                ec2.InstanceSize.MEDIUM
            ),
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            securityGroups: [dbSecurityGroup],
            databaseName: 'visionaryfuture',
            credentials: rds.Credentials.fromGeneratedSecret('postgres'),
            backupRetention: cdk.Duration.days(7),
            allocatedStorage: 20,
            maxAllocatedStorage: 100,  // 自動スケーリング設定
            monitoringInterval: cdk.Duration.minutes(1),
            enablePerformanceInsights: true,
            performanceInsightRetention: rds.PerformanceInsightRetention.DEFAULT,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            deletionProtection: false,
            parameterGroup: dbParameterGroup,
            storageEncrypted: true,
        });

        const generatedSecret = this.database.secret!;

        // ECSクラスターの作成
        this.cluster = new ecs.Cluster(this, 'AppCluster', {
            vpc: props.vpc,
            containerInsights: true,
        });

        // ロググループの作成
        const logGroup = new logs.LogGroup(this, 'BackendLogGroup', {
            logGroupName: '/ecs/visionaryfuture-backend',
            retention: logs.RetentionDays.ONE_MONTH,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // バックエンド用のタスク定義
        const taskRole = new iam.Role(this, 'BackendTaskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });

        taskRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
        );

        // SSMパラメータストアへのアクセス権を追加
        taskRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'ssm:GetParameters',
                'ssm:GetParameter',
                'secretsmanager:GetSecretValue',
                'ssm:StartSession',
                'ssm:DescribeSessions',
                'ssm:GetConnectionStatus',
                'ssm:GetSession',
                'ssm:ListSessions',
                'ssm:TerminateSession',
                'ssm:ResumeSession',
            ],
            resources: ['*'],
        }));

        // Session Managerで必要なSSM Messagesアクセス権を追加
        taskRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'ssmmessages:CreateControlChannel',
                'ssmmessages:CreateDataChannel',
                'ssmmessages:OpenControlChannel',
                'ssmmessages:OpenDataChannel',
            ],
            resources: ['*'],
        }));

        // タスク実行ロール
        const executionRole = new iam.Role(this, 'BackendExecutionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });

        executionRole.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
        );

        // SSMパラメータを作成する前にdb_hostを設定
        const appEnvParams = {
            'APP_NAME': 'VisionaryFuture',
            'APP_ENV': 'production',
            'APP_DEBUG': 'false',
            'FRONTEND_URL': 'https://visionaryfuture.shop',
            'DB_CONNECTION': 'pgsql',
            'DB_PORT': '5432',
            'DB_DATABASE': 'visionaryfuture',
        };

        // SSMパラメータの作成
        const ssmParams: Record<string, ssm.StringParameter> = {};
        for (const [key, value] of Object.entries(appEnvParams)) {
            ssmParams[key] = new ssm.StringParameter(this, `SSMParam${key}`, {
                parameterName: `/visionaryfuture/${process.env.ENV || 'dev'}/${key.toLowerCase()}`,
                stringValue: value,
                tier: ssm.ParameterTier.STANDARD,
            });
        }

        // バックエンドタスク定義
        const backendTaskDefinition = new ecs.FargateTaskDefinition(this, 'BackendTaskDef', {
            memoryLimitMiB: 2048,
            cpu: 1024,
            taskRole,
            executionRole,
        });

        // コンテナ定義
        const backendContainer = backendTaskDefinition.addContainer('BackendContainer', {
            image: ecs.ContainerImage.fromEcrRepository(props.ecrRepository),
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'backend',
                logGroup,
            }),
            portMappings: [
                {
                    containerPort: parseInt(process.env.BACKEND_CONTAINER_PORT || '8000'),
                    hostPort: parseInt(process.env.BACKEND_CONTAINER_PORT || '8000'),
                    protocol: ecs.Protocol.TCP,
                },
            ],
            environment: {
                // コンテナ起動時に動的に設定される環境変数
                'AWS_REGION': this.region,
                'APP_URL': 'https://api.visionaryfuture.shop',
                'DB_HOST': this.database.dbInstanceEndpointAddress,  // RDSエンドポイントを設定
            },
            secrets: {
                ...Object.fromEntries(
                    Object.entries(ssmParams).map(([key, param]) => [
                        key,
                        ecs.Secret.fromSsmParameter(param)
                    ])
                ),
                // データベース認証情報をSecrets Managerから取得
                'DB_USERNAME': ecs.Secret.fromSecretsManager(generatedSecret, 'username'),
                'DB_PASSWORD': ecs.Secret.fromSecretsManager(generatedSecret, 'password'),
            },
        });

        // ALBの作成
        this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'BackendALB', {
            vpc: props.vpc,
            internetFacing: true,
            securityGroup: props.backendSecurityGroup,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        });

        // ALBのリスナー定義
        const httpListener = this.loadBalancer.addListener('HttpListener', {
            port: 80,
            open: true,
        });

        const httpsListener = this.loadBalancer.addListener('HttpsListener', {
            port: 443,
            certificates: [this.apiCertificate],
            open: true,
        });

        // ECSサービスの作成
        this.backendService = new ecs.FargateService(this, 'BackendService', {
            cluster: this.cluster,
            taskDefinition: backendTaskDefinition,
            desiredCount: 2,
            securityGroups: [props.backendTaskSecurityGroup],
            assignPublicIp: false,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            enableExecuteCommand: true,  // CloudShellからのアクセスを可能にする
        });

        // ALBターゲットグループの作成とサービスへの登録
        httpListener.addTargets('BackendHttpTarget', {
            port: parseInt(process.env.BACKEND_CONTAINER_PORT || '8000'),
            targets: [this.backendService],
            healthCheck: {
                path: '/api/health',
                interval: cdk.Duration.seconds(60),
                timeout: cdk.Duration.seconds(5),
                healthyHttpCodes: '200',
            },
            deregistrationDelay: cdk.Duration.seconds(60),
            slowStart: cdk.Duration.seconds(60),
        });

        httpsListener.addTargets('BackendHttpsTarget', {
            port: parseInt(process.env.BACKEND_CONTAINER_PORT || '8000'),
            targets: [this.backendService],
            healthCheck: {
                path: '/api/health',
                interval: cdk.Duration.seconds(60),
                timeout: cdk.Duration.seconds(5),
                healthyHttpCodes: '200',
            },
            deregistrationDelay: cdk.Duration.seconds(60),
            slowStart: cdk.Duration.seconds(60),
        });

        // Auto Scaling設定
        const scaling = this.backendService.autoScaleTaskCount({
            minCapacity: 2,
            maxCapacity: 10,
        });

        scaling.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 70,
            scaleInCooldown: cdk.Duration.seconds(60),
            scaleOutCooldown: cdk.Duration.seconds(60),
        });

        scaling.scaleOnMemoryUtilization('MemoryScaling', {
            targetUtilizationPercent: 70,
            scaleInCooldown: cdk.Duration.seconds(60),
            scaleOutCooldown: cdk.Duration.seconds(60),
        });

        // 出力
        new cdk.CfnOutput(this, 'BackendLoadBalancerDNS', {
            value: this.loadBalancer.loadBalancerDnsName,
            description: 'The DNS name of the backend load balancer',
            exportName: 'BackendLoadBalancerDNS',
        });
    }
}