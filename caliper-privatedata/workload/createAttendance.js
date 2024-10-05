'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = -1;
        this.events = ['parade', 'party', 'concert', 'congress', 'reunion', 'funeral', 'game'];
    }

    /**
    * Initialize the workload module with the given parameters.
    * @param {number} workerIndex The 0-based index of the worker instantiating the workload module.
    * @param {number} totalWorkers The total number of workers participating in the round.
    * @param {number} roundIndex The 0-based index of the currently executing round.
    * @param {Object} roundArguments The user-provided arguments for the round from the benchmark configuration file.
    * @param {ConnectorBase} sutAdapter The adapter of the underlying SUT.
    * @param {Object} sutContext The custom context object provided by the SUT adapter.
    * @async
    */
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }
    async submitTransaction() {
        this.txIndex++;

        const attendanceID = `${this.roundIndex}_${this.workerIndex}_${this.txIndex}_${Date.now()}`;
        let userid = this.txIndex;//(Math.floor(Math.random() * (5000 - 7 + 1) + 7)); // random number between 7 and 5000
        let event = this.events[this.txIndex % this.events.length]; 
        let lat = (Math.random() * ((-90) - (90)) + 90).toFixed(3) * 1;
        let lon = (Math.random() * ((-180) - (180)) + 180).toFixed(3) * 1;
        let date = (randomDate(new Date(2024, 0, 1), new Date()))

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'CreateAttendance',
            invokerIdentity: 'User1',
            contractArguments: [attendanceID, userid, event, lat, lon, date],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }

}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;