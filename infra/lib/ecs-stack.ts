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

interface EcsStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    backendSecurityGroup: ec2.SecurityGroup;
    backendTaskSecurityGroup: ec2.SecurityGroup;
    ecrRepository: ecr.Repository;
}

export class EcsStack extends cdk.Stack {
    public readonly cluster: ecs.Cluster;
    public readonly backendService: ecs.FargateService;
    public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: EcsStackProps) {
        super(scope, id, props);

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

        // 環境変数用のSSMパラメータを作成
        const appEnvParams = {
            'APP_NAME': 'VisionaryFuture',
            'APP_ENV': 'production',
            'APP_DEBUG': 'false',
            'FRONTEND_URL': 'https://visionaryfuture.shop',
            'DB_CONNECTION': 'pgsql',
            'DB_HOST': 'localhost', // 後でRDSに更新
            'DB_PORT': '5432',
            'DB_DATABASE': 'visionaryfuture',
            'DB_USERNAME': 'postgres', // シークレットマネージャーに移行
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
            },
            secrets: Object.fromEntries(
                Object.entries(ssmParams).map(([key, param]) => [
                    key,
                    ecs.Secret.fromSsmParameter(param)
                ])
            ),
        });

        // ALBの作成
        this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'BackendALB', {
            vpc: props.vpc,
            internetFacing: true,
            securityGroup: props.backendSecurityGroup,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
        });

        // ALBのリスナー定義
        const listener = this.loadBalancer.addListener('HttpListener', {
            port: 80,
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
        });

        // ALBターゲットグループの作成とサービスへの登録
        listener.addTargets('BackendTarget', {
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