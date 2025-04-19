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
import * as iam from 'aws-cdk-lib/aws-iam';

interface FrontendStackProps extends cdk.StackProps {
    backendAlb: elbv2.ApplicationLoadBalancer;
    domainName: string;
    hostedZoneId: string;
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
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            encryption: s3.BucketEncryption.S3_MANAGED,
        });

        // ACM証明書の作成（フロントエンド用）
        const certificate = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
            domainName: props.domainName,
            subjectAlternativeNames: [`*.${props.domainName}`],
            hostedZone,
            region: 'us-east-1', // CloudFront用証明書はus-east-1リージョンに作成する必要がある
        });

        // API用の証明書（現在のリージョン）
        const apiCertificate = new acm.DnsValidatedCertificate(this, 'ApiCertificate', {
            domainName: `api.${props.domainName}`,
            hostedZone,
        });

        // SSM Parameter に証明書のARNを保存
        new ssm.StringParameter(this, 'ApiCertificateArn', {
            parameterName: `/visionaryfuture/${process.env.ENV || 'dev'}/api-certificate-arn`,
            stringValue: apiCertificate.certificateArn,
        });

        // CloudFront オリジンアクセスコントロール
        const oac = new cloudfront.CfnOriginAccessControl(this, 'OAC', {
            originAccessControlConfig: {
                name: 'S3OriginAccessControl',
                originAccessControlOriginType: 's3',
                signingBehavior: 'always',
                signingProtocol: 'sigv4',
            },
        });

        // CloudFront ディストリビューションの作成
        const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
            defaultRootObject: 'index.html',
            domainNames: [props.domainName, `www.${props.domainName}`],
            certificate,
            defaultBehavior: {
                origin: new origins.S3Origin(frontendBucket),
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

        // バケットポリシーの更新（CloudFrontからのアクセスを許可）
        const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
        cfnDistribution.addPropertyOverride('DistributionConfig.Origins.0.OriginAccessControlId', oac.attrId);

        // S3バケットポリシーの更新
        const bucketPolicy = new s3.BucketPolicy(this, 'BucketPolicy', {
            bucket: frontendBucket,
        });

        bucketPolicy.document.addStatements(
            new iam.PolicyStatement({
                actions: ['s3:GetObject'],
                effect: iam.Effect.ALLOW,
                principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
                resources: [`${frontendBucket.bucketArn}/*`],
                conditions: {
                    StringEquals: {
                        'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
                    },
                },
            })
        );

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

        // Backend ALB用のRoute 53レコードの作成
        new route53.ARecord(this, 'ApiAliasRecord', {
            recordName: `api.${props.domainName}`,
            target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(props.backendAlb)),
            zone: hostedZone,
        });

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
}