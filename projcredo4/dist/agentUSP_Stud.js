"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const askar_1 = require("@credo-ts/askar");
const core_1 = require("@credo-ts/core");
const node_1 = require("@credo-ts/node");
const aries_askar_nodejs_1 = require("@hyperledger/aries-askar-nodejs");
const initializeStudAgent = async () => {
    const config = {
        label: 'agent-stud',
        walletConfig: {
            id: 'mainStud',
            key: 'demoagentstud00000000000000000000',
        },
    };
    const agent = new core_1.Agent({
        config,
        modules: {
            askar: new askar_1.AskarModule({ ariesAskar: aries_askar_nodejs_1.ariesAskar }),
            connections: new core_1.ConnectionsModule({ autoAcceptConnections: true }),
        },
        dependencies: node_1.agentDependencies,
    });
    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
    await agent.initialize();
    return agent;
};
const initializeUSPAgent = async () => {
    const config = {
        label: 'agent-USP',
        walletConfig: {
            id: 'mainUSP',
            key: 'demoagentUSP0000000000000000000',
        },
        endpoints: ['http://localhost:3001'],
    };
    const agent = new core_1.Agent({
        config,
        modules: {
            askar: new askar_1.AskarModule({ ariesAskar: aries_askar_nodejs_1.ariesAskar }),
            connections: new core_1.ConnectionsModule({ autoAcceptConnections: true }),
        },
        dependencies: node_1.agentDependencies,
    });
    agent.registerOutboundTransport(new core_1.WsOutboundTransport());
    agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
    agent.registerInboundTransport(new node_1.HttpInboundTransport({ port: 3001 }));
    await agent.initialize();
    return agent;
};
const createNewInvitation = async (agent) => {
    const outOfBandRecord = await agent.oob.createInvitation();
    return {
        invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://example.org' }),
        outOfBandRecord,
    };
};
const createLegacyInvitation = async (agent) => {
    const { invitation } = await agent.oob.createLegacyInvitation();
    return invitation.toUrl({ domain: 'https://example.org' });
};
const receiveInvitation = async (agent, invitationUrl) => {
    const { outOfBandRecord } = await agent.oob.receiveInvitationFromUrl(invitationUrl);
    return outOfBandRecord;
};
const setupConnectionListener = (agent, outOfBandRecord, cb) => {
    agent.events.on(core_1.ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
        if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id)
            return;
        if (payload.connectionRecord.state === core_1.DidExchangeState.Completed) {
            console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`);
            cb();
            process.exit(0);
        }
    });
};
const run = async () => {
    var inicio = performance.now();
    console.log('Initializing Student agent...');
    const studAgent = await initializeStudAgent();
    console.log(performance.now() - inicio);
    console.log('Initializing USP agent...');
    const USPAgent = await initializeUSPAgent();
    console.log('Creating the invitation as USP...');
    const { outOfBandRecord, invitationUrl } = await createNewInvitation(USPAgent);
    console.log('Listening for connection changes...');
    setupConnectionListener(USPAgent, outOfBandRecord, () => console.log(''));
    console.log('Accepting the invitation as Student...');
    await receiveInvitation(studAgent, invitationUrl);
    console.log(performance.now() - inicio);
};
exports.default = run;
void run();
