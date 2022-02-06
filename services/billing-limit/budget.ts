import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config("billing-limit");
const billingAccount = config.require("billing-account");
const threshold = parseInt(config.require("threshold"));
const currency = config.require("currency");
const amount = config.require("amount");

export const budgetTopic = new gcp.pubsub.Topic("budget-topic", undefined);

const resourceManagerApi = new gcp.projects.Service("resource-manager-api", {
    service: "cloudresourcemanager.googleapis.com",
    disableDependentServices: true,
});

const billingApi = new gcp.projects.Service("billing-api", {
    service: "billingbudgets.googleapis.com",
    disableDependentServices: true,
});

new gcp.billing.Budget(
    "server-budget",
    {
        billingAccount: billingAccount,
        thresholdRules: [{ thresholdPercent: threshold }],
        allUpdatesRule: { pubsubTopic: budgetTopic.id },
        amount: {
            specifiedAmount: {
                currencyCode: currency,
                units: amount,
            },
        },
    },
    { dependsOn: [billingApi, resourceManagerApi] }
);
