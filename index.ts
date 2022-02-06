// import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const managerApi = new gcp.projects.Service("server-compute-api", {
    service: "cloudresourcemanager.googleapis.com",
    disableDependentServices: true,
});

const computeApi = new gcp.projects.Service(
    "server-compute-api",
    {
        service: "compute.googleapis.com",
        disableDependentServices: true,
    },
    { dependsOn: managerApi }
);

const externalIp = new gcp.compute.Address("server-address", {}, { dependsOn: computeApi });

const network = new gcp.compute.Network("server-network", { autoCreateSubnetworks: true }, { dependsOn: computeApi });

new gcp.compute.Firewall(
    "server-firewall",
    {
        network: network.id,
        sourceRanges: ["0.0.0.0/0"],
        allows: [
            {
                protocol: "tcp",
                ports: ["22", "80"],
            },
        ],
    },
    { dependsOn: computeApi }
);

const disk = new gcp.compute.Disk(
    "server-disk",
    {
        size: 30,
        image: "ubuntu-minimal-2004-lts",
        type: "pd-ssd",
    },
    { dependsOn: computeApi }
);

const instance = new gcp.compute.Instance(
    "server-instance",
    {
        machineType: "c2-standard-4",
        bootDisk: {
            autoDelete: false,
            source: disk.id,
        },
        networkInterfaces: [
            {
                network: network.id,
                accessConfigs: [{ natIp: externalIp.address }],
            },
        ],
        scheduling: {
            automaticRestart: false,
            preemptible: true,
        },
        metadata: {
            "enable-oslogin": "TRUE",
        },
    },
    { dependsOn: computeApi }
);

export const address = instance.networkInterfaces[0].accessConfigs!.apply((cs) => cs![0].natIp);
