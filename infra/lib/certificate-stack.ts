import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface CertificateStackProps extends cdk.StackProps {
  domainName: string;
  hostedZoneId: string;
}

export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    // ホストゾーンの取得
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });

    // CloudFront用のACM証明書（us-east-1リージョンに作成）
    this.certificate = new acm.Certificate(this, 'CloudFrontCertificate', {
      domainName: props.domainName,
      subjectAlternativeNames: [`*.${props.domainName}`],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // 証明書ARNをSSMパラメータストアに保存（他のリージョンから参照できるように）
    new ssm.StringParameter(this, 'CloudFrontCertificateArn', {
      parameterName: `/visionaryfuture/${process.env.ENV || 'dev'}/cloudfront-certificate-arn`,
      stringValue: this.certificate.certificateArn,
    });
  }
}