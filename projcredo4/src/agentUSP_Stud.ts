import { AskarModule } from '@credo-ts/askar'
import {
  Agent,
  InitConfig,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  WsOutboundTransport,
  HttpOutboundTransport,
  DidExchangeState,
  OutOfBandRecord,
  ConnectionsModule,
} from '@credo-ts/core'
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'

const initializeStudAgent = async () => {

  const config: InitConfig = {
    label: 'agent-stud',
    walletConfig: {
      id: 'mainStud',
      key: 'demoagentstud00000000000000000000',
    },
  }

  const agent = new Agent({
    config,
    modules: {
      askar: new AskarModule({ ariesAskar }),
      connections: new ConnectionsModule({ autoAcceptConnections: true }),
    },
    dependencies: agentDependencies,
  })

  agent.registerOutboundTransport(new WsOutboundTransport())

  agent.registerOutboundTransport(new HttpOutboundTransport())

  await agent.initialize()

  return agent
}

const initializeUSPAgent = async () => {

  const config: InitConfig = {
    label: 'agent-USP',
    walletConfig: {
      id: 'mainUSP',
      key: 'demoagentUSP0000000000000000000',
    },
    endpoints: ['http://localhost:3001'],
  }

  const agent = new Agent({
    config,
    modules: {
      askar: new AskarModule({ ariesAskar }),
      connections: new ConnectionsModule({ autoAcceptConnections: true }),
    },
    dependencies: agentDependencies,
  })

  agent.registerOutboundTransport(new WsOutboundTransport())

  agent.registerOutboundTransport(new HttpOutboundTransport())

  agent.registerInboundTransport(new HttpInboundTransport({ port: 3001 }))

  await agent.initialize()

  return agent
}

const createNewInvitation = async (agent: Agent) => {
  const outOfBandRecord = await agent.oob.createInvitation()

  return {
    invitationUrl: outOfBandRecord.outOfBandInvitation.toUrl({ domain: 'https://example.org' }),
    outOfBandRecord,
  }
}

const createLegacyInvitation = async (agent: Agent) => {
  const { invitation } = await agent.oob.createLegacyInvitation()

  return invitation.toUrl({ domain: 'https://example.org' })
}

const receiveInvitation = async (agent: Agent, invitationUrl: string) => {
  const { outOfBandRecord } = await agent.oob.receiveInvitationFromUrl(invitationUrl)

  return outOfBandRecord
}

const setupConnectionListener = (agent: Agent, outOfBandRecord: OutOfBandRecord, cb: (...args: any) => void) => {
  agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, ({ payload }) => {
    if (payload.connectionRecord.outOfBandId !== outOfBandRecord.id) return
    if (payload.connectionRecord.state === DidExchangeState.Completed) {

      console.log(`Connection for out-of-band id ${outOfBandRecord.id} completed`)

      cb()

      process.exit(0)
    }
  })
}


const run = async () => {

  var inicio = performance.now();

  console.log('Initializing Student agent...')
  const studAgent = await initializeStudAgent()
  console.log(performance.now() - inicio)
  console.log('Initializing USP agent...')
  const USPAgent = await initializeUSPAgent()

  console.log('Creating the invitation as USP...')
  const { outOfBandRecord, invitationUrl } = await createNewInvitation(USPAgent)

  console.log('Listening for connection changes...')
  setupConnectionListener(USPAgent, outOfBandRecord, () =>
    console.log('')
  )

  console.log('Accepting the invitation as Student...')
  await receiveInvitation(studAgent, invitationUrl)

  console.log(performance.now() - inicio)
}

export default run

void run()
