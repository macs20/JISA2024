'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        for (let i = 0; i < this.roundArguments.assets; i++) {
            const attendanceID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating attendance ${attendanceID}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'CreateAttendance',
                invokerIdentity: 'User1',
                contractArguments: [attendanceID, 121, 'Parade2024', -72.125, 150.566, '10/09/2024'],
                readOnly: false
            };
            await this.sutAdapter.sendRequests(request);
        }
    }
    async submitTransaction() {
        const randomId = Math.floor(Math.random() * this.roundArguments.assets);
        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'ReadAttendance',
            invokerIdentity: 'User1',
            contractArguments: [`${this.workerIndex}_${randomId}`],
            readOnly: true
        };
        await this.sutAdapter.sendRequests(myArgs);
    }

    async cleanupWorkloadModule() {
        for (let i = 0; i < this.roundArguments.assets; i++) {
            const attendanceID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Deleting attendance ${attendanceID}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'DeleteAttendance',
                invokerIdentity: 'User1',
                contractArguments: [attendanceID],
                readOnly: false
            };
            await this.sutAdapter.sendRequests(request);
        }
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;