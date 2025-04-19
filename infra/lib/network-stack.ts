import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
    public readonly backendSecurityGroup: ec2.SecurityGroup;
    public readonly backendTaskSecurityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // VPCの作成
        this.vpc = new ec2.Vpc(this, 'AppVpc', {
            maxAzs: 2, // 2つのアベイラビリティゾーンを使用
            natGateways: 1, // コスト削減のため、1つのNATゲートウェイを使用
            subnetConfiguration: [
                {
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidrMask: 24,
                },
            ],
        });

        // バックエンドのALB用セキュリティグループ
        this.backendSecurityGroup = new ec2.SecurityGroup(this, 'BackendALBSecurityGroup', {
            vpc: this.vpc,
            description: 'Security Group for Backend Application Load Balancer',
            allowAllOutbound: true,
        });

        // HTTP/HTTPSトラフィックを許可
        this.backendSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'Allow HTTP traffic from anywhere'
        );

        this.backendSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'Allow HTTPS traffic from anywhere'
        );

        // バックエンドのECSタスク用セキュリティグループ
        this.backendTaskSecurityGroup = new ec2.SecurityGroup(this, 'BackendTaskSecurityGroup', {
            vpc: this.vpc,
            description: 'Security Group for Backend ECS Tasks',
            allowAllOutbound: true,
        });

        // ALBからのトラフィックのみ許可
        this.backendTaskSecurityGroup.addIngressRule(
            this.backendSecurityGroup,
            ec2.Port.tcp(8000),
            'Allow traffic from ALB to backend container port'
        );

        // VPCエンドポイントの作成
        this.createVpcEndpoints();

        // 出力
        new cdk.CfnOutput(this, 'VpcId', {
            value: this.vpc.vpcId,
            description: 'The ID of the VPC',
            exportName: 'VpcId',
        });
    }

    private createVpcEndpoints() {
        // ECRとSSMへのVPCエンドポイントを作成
        // これにより、プライベートサブネット内のECSタスクがインターネットを経由せずにAWSサービスにアクセス可能になる
        const gatewayEndpoints = {
            's3': ec2.GatewayVpcEndpointAwsService.S3,
            'dynamodb': ec2.GatewayVpcEndpointAwsService.DYNAMODB,
        };

        const interfaceEndpoints = {
            'ecr-api': ec2.InterfaceVpcEndpointAwsService.ECR,
            'ecr-dkr': ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
            'ssm': ec2.InterfaceVpcEndpointAwsService.SSM,
            'ssm-messages': ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
            'cloudwatch-logs': ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
            'secretsmanager': ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        };

        // ゲートウェイエンドポイントの作成
        for (const [id, service] of Object.entries(gatewayEndpoints)) {
            this.vpc.addGatewayEndpoint(id, {
                service,
            });
        }

        // インターフェースエンドポイントの作成
        for (const [id, service] of Object.entries(interfaceEndpoints)) {
            this.vpc.addInterfaceEndpoint(id, {
                service,
                privateDnsEnabled: true,
            });
        }
    }
}