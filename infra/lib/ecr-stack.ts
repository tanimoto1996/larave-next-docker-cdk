import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class EcrStack extends cdk.Stack {
    public readonly backendRepository: ecr.Repository;
    public readonly frontendRepository: ecr.Repository;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // バックエンド用のECRリポジトリ
        this.backendRepository = new ecr.Repository(this, 'BackendRepository', {
            repositoryName: 'visionaryfuture-backend',
            imageScanOnPush: true,
            lifecycleRules: [
                {
                    maxImageCount: 5, // コスト削減のため、古いイメージを削除
                    description: 'Keep only 5 images',
                },
            ],
        });

        // 出力
        new cdk.CfnOutput(this, 'BackendRepositoryUri', {
            value: this.backendRepository.repositoryUri,
            description: 'The URI of the Backend Repository',
            exportName: 'BackendRepositoryUri',
        });
    }
}