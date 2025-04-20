import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface FrontendStackProps extends cdk.StackProps {
    backendAlb?: elbv2.ApplicationLoadBalancer; // オプショナルに変更
    domainName: string;
    hostedZoneId: string;
    cloudfrontCertificateArn?: string; // us-east-1の証明書ARNを受け取る（オプショナル）
}

export class FrontendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        // ホストゾーンの取得
        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: props.hostedZoneId,
            zoneName: props.domainName,
        });

        // フロントエンド用のS3バケットを作成
        const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
            bucketName: `${props.domainName}-frontend`,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            encryption: s3.BucketEncryption.S3_MANAGED,
        });

        // CloudFront証明書の参照（us-east-1から）
        let cloudfrontCertificate;
        
        if (props.cloudfrontCertificateArn) {
            // 直接ARNが提供されている場合はそれを使用
            cloudfrontCertificate = acm.Certificate.fromCertificateArn(
                this, 
                'ImportedCloudFrontCertificate', 
                props.cloudfrontCertificateArn
            );
        } else {
            // SSMパラメータストアから証明書ARNを取得して使用
            const certificateArn = ssm.StringParameter.valueForStringParameter(
                this,
                `/visionaryfuture/${process.env.ENV || 'dev'}/cloudfront-certificate-arn`
            );
            
            cloudfrontCertificate = acm.Certificate.fromCertificateArn(
                this, 
                'CloudFrontCertificate', 
                certificateArn
            );
        }

        // CloudFront Origin Access Identity（OAI）の作成
        const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
            comment: `OAI for ${props.domainName}`
        });

        // S3バケットにOAIからのアクセスを許可
        frontendBucket.grantRead(originAccessIdentity);

        // CloudFront ディストリビューションの作成
        const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
            defaultRootObject: 'index.html',
            domainNames: [props.domainName, `www.${props.domainName}`],
            certificate: cloudfrontCertificate, // バージニア北部リージョンの証明書を使用
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessIdentity(
                    frontendBucket,
                    { originAccessIdentity }
                ),
                compress: true,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            additionalBehaviors: {
                '/api/*': {
                    origin: new origins.HttpOrigin(`api.${props.domainName}`),
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                }
            },
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        });

        // Route 53 レコードの作成（フロントエンド用）
        new route53.ARecord(this, 'SiteAliasRecord', {
            recordName: props.domainName,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
            zone: hostedZone,
        });

        new route53.ARecord(this, 'WwwSiteAliasRecord', {
            recordName: `www.${props.domainName}`,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
            zone: hostedZone,
        });

        // バックエンドALBがある場合は、DNSレコードを設定
        if (props.backendAlb) {
            this.setupBackendRouting(props.backendAlb, hostedZone, props.domainName);
        }

        // 出力
        new cdk.CfnOutput(this, 'DistributionId', {
            value: distribution.distributionId,
            description: 'The ID of the CloudFront distribution',
            exportName: 'CloudFrontDistributionId',
        });

        new cdk.CfnOutput(this, 'FrontendBucketName', {
            value: frontendBucket.bucketName,
            description: 'The name of the S3 bucket storing frontend assets',
            exportName: 'FrontendBucketName',
        });

        new cdk.CfnOutput(this, 'FrontendURL', {
            value: `https://${props.domainName}`,
            description: 'Frontend URL',
            exportName: 'FrontendURL',
        });

        new cdk.CfnOutput(this, 'BackendURL', {
            value: `https://api.${props.domainName}`,
            description: 'Backend API URL',
            exportName: 'BackendURL',
        });
    }

    // バックエンドALBへのルーティングをセットアップするメソッド（修正版）
    private setupBackendRouting(
        backendAlb: elbv2.ApplicationLoadBalancer, 
        hostedZone: route53.IHostedZone,
        domainName: string
    ) {
        // Backend ALB用のRoute 53レコードの作成
        new route53.ARecord(this, 'ApiAliasRecord', {
            recordName: `api.${domainName}`,
            target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(backendAlb)),
            zone: hostedZone,
        });
    }
}