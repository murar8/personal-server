import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const gcpConfig = new pulumi.Config("gcp");
const projectId = gcpConfig.require("project");

const config = new pulumi.Config("billing-limit");
const billingAccount = config.require("billing-account");

import { budgetTopic } from "./budget";
import { onMessagePublished } from "./callback";

const cloudBuildApi = new gcp.projects.Service("cloud-build-api", {
    service: "cloudbuild.googleapis.com",
    disableDependentServices: true,
});

const cloudBillingApi = new gcp.projects.Service("cloud-billing-api", {
    service: "cloudbilling.googleapis.com",
    disableDependentServices: true,
});

const functionsApi = new gcp.projects.Service("functions-api", {
    service: "cloudfunctions.googleapis.com",
    disableDependentServices: true,
});

const budgetFunction = new gcp.cloudfunctions.CallbackFunction(
    "budget-function",
    {
        callback: onMessagePublished,
        runtime: "nodejs16",
        environmentVariables: { GOOGLE_CLOUD_PROJECT: projectId },
        eventTrigger: {
            resource: budgetTopic.id,
            eventType: "google.pubsub.topic.publish",
        },
    },
    { dependsOn: [functionsApi, cloudBuildApi, cloudBillingApi] }
);

new gcp.billing.AccountIamBinding("adw", {
    members: [budgetFunction.function.serviceAccountEmail.apply((e) => `serviceAccount:${e}`)],
    role: "roles/billing.admin",
    billingAccountId: billingAccount,
});
