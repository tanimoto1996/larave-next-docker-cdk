#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { EcrStack } from '../lib/ecr-stack';
import { EcsStack } from '../lib/ecs-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { CertificateStack } from '../lib/certificate-stack';

const app = new cdk.App();

// デフォルトの環境変数から設定を取得
const env = {
    account: process.env.AWS_ACCOUNT_ID || '058264478049',
    region: process.env.AWS_REGION || 'ap-northeast-1'
};

// バージニア北部リージョン用の環境設定
const usEast1Env = {
    account: env.account,
    region: 'us-east-1'
};

// ドメイン名とホストゾーンIDの定義
const domainName = process.env.DOMAIN_NAME || 'visionaryfuture.shop';
const hostedZoneId = process.env.HOSTED_ZONE_ID || 'Z0685082DS30JP1ITNZ6';

// バージニア北部リージョンにACM証明書を作成するスタック（CloudFront用）
const certificateStack = new CertificateStack(app, 'CertificateStack', {
    env: usEast1Env,
    domainName,
    hostedZoneId,
});

// ネットワークスタック（VPC、サブネット、セキュリティグループなど）
const networkStack = new NetworkStack(app, 'NetworkStack', { env });

// ECRリポジトリスタック
const ecrStack = new EcrStack(app, 'EcrStack', { env });

// ECSクラスタースタック（バックエンド用）
// このスタック内でAPI用のACM証明書を作成する
const ecsStack = new EcsStack(app, 'EcsStack', {
    env,
    crossRegionReferences: true,  // スタックレベルで設定
    vpc: networkStack.vpc,
    backendSecurityGroup: networkStack.backendSecurityGroup,
    backendTaskSecurityGroup: networkStack.backendTaskSecurityGroup,
    ecrRepository: ecrStack.backendRepository,
    domainName,
    hostedZoneId,
});

// フロントエンド用スタック（CloudFront、S3、Route53など）
const frontendStack = new FrontendStack(app, 'FrontendStack', {
    env,
    crossRegionReferences: true,  // スタックレベルで設定
    domainName,
    hostedZoneId,
    cloudfrontCertificateArn: certificateStack.certificate.certificateArn,
    backendAlb: ecsStack.loadBalancer,
});

app.synth();