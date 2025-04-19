#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { EcrStack } from '../lib/ecr-stack';
import { EcsStack } from '../lib/ecs-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// 環境変数から設定を取得
const env = {
    account: process.env.AWS_ACCOUNT_ID || '058264478049',
    region: process.env.AWS_REGION || 'ap-northeast-1'
};

// ネットワークスタック（VPC、サブネット、セキュリティグループなど）
const networkStack = new NetworkStack(app, 'NetworkStack', { env });

// ECRリポジトリスタック
const ecrStack = new EcrStack(app, 'EcrStack', { env });

// ECSクラスタースタック（バックエンド用）
const ecsStack = new EcsStack(app, 'EcsStack', {
    env,
    vpc: networkStack.vpc,
    backendSecurityGroup: networkStack.backendSecurityGroup,
    backendTaskSecurityGroup: networkStack.backendTaskSecurityGroup,
    ecrRepository: ecrStack.backendRepository,
});

// フロントエンド用スタック（CloudFront、S3、Route53など）
new FrontendStack(app, 'FrontendStack', {
    env,
    backendAlb: ecsStack.loadBalancer,
    domainName: process.env.DOMAIN_NAME || 'visionaryfuture.shop',
    hostedZoneId: process.env.HOSTED_ZONE_ID || 'Z0685082DS30JP1ITNZ6',
});

app.synth();