import * as pulumi from "@pulumi/pulumi";
import * as compute from "@pulumi/google-native/compute/v1";

const server = new compute.Instance("development-server", {});
