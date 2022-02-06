import * as gcp from "@pulumi/gcp";

import { CloudBillingClient } from "@google-cloud/billing";

interface Message {
    budgetDisplayName: string;
    alertThresholdExceeded: number;
    costAmount: number;
    costIntervalStart: string;
    budgetAmount: number;
    budgetAmountType: string;
    currencyCode: string;
}

export async function onMessagePublished(event: gcp.pubsub.TopicData): Promise<void> {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT!;
    const projectName = `projects/${projectId}`;

    console.log(projectName);

    const billingClient = new CloudBillingClient();
    const message = JSON.parse(Buffer.from(event.data, "base64").toString()) as Message;

    if (message.costAmount <= message.budgetAmount) return console.log("No action necessary.");

    try {
        const [res] = await billingClient.getProjectBillingInfo({ name: projectName });
        if (!res.billingEnabled) return console.log("Billing already disabled.");
    } catch {
        console.log("Unable to determine if billing is enabled on specified project, assuming billing is enabled.");
    }

    await billingClient.updateProjectBillingInfo({
        name: projectName,
        projectBillingInfo: { billingAccountName: "" },
    });

    console.log("Billing disabled.");
}
