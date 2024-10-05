
'use strict';

const { Contract } = require('fabric-contract-api');

class AttendanceContract extends Contract {

    async InitLedger(ctx) {
        const attendances = [
            {
                ID: 'attendance1',
                UserID: 1,
                Event: 'parade12',
                Lat: -170.001,
                Lon: 55.001,
                Date: '10/02/2024 - 19h00',
            },
            {
                ID: 'attendance2',
                UserID: 2,
                Event: 'parade12',
                Lat: -170.002,
                Lon: 55.002,
                Date: '10/02/2024 - 19h05',
            },
            {
                ID: 'attendance3',
                UserID: 3,
                Event: 'concert13',
                Lat: -170.003,
                Lon: 55.003,
                Date: '11/02/2024 - 13h33',
            },
            {
                ID: 'attendance4',
                UserID: 4,
                Event: 'parade12',
                Lat: -170.004,
                Lon: 55.004,
                Date: '10/02/2024 - 19h10',
            },
            {
                ID: 'attendance5',
                UserID: 5,
                Event: 'concert13',
                Lat: -170.005,
                Lon: 55.005,
                Date: '11/02/2024 - 13h50',
            },
            {
                ID: 'attendance6',
                UserID: 6,
                Event: 'party14',
                Lat: -170.006,
                Lon: 55.006,
                Date: '13/02/2024 - 23h30',
            },
        ];

        for (const attendance of attendances) {
            attendance.docType = 'attendance';
            await ctx.stub.putState(attendance.ID, Buffer.from(JSON.stringify(attendance)));
            console.info(`Attendance ${attendance.ID} initialized`);
        }
    }

     async CreateAttendance(ctx, id, userID, event, lat, lon, date) {
        const attendance = {
            ID: id,
            UserID: userID,
            Event: event,
            Lat: lat,
            Lon: lon,
            Date: date,
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(attendance)));
        return JSON.stringify(attendance);
    }

    async ReadAttendance(ctx, id) {
        const attendanceJSON = await ctx.stub.getState(id); 
        if (!attendanceJSON || attendanceJSON.length === 0) {
            throw new Error(`The attendance ${id} does not exist`);
        }
        return attendanceJSON.toString();
    }

    async UpdateAttendance(ctx, id, userID, event, lat, lon, date) {
        const exists = await this.AttendanceExists(ctx, id);
        if (!exists) {
            throw new Error(`The attendance ${id} does not exist`);
        }

        const updatedAttendace = {
            ID: id,
            UserID: userID,
            Event: event,
            Lat: lat,
            Lon: lon,
            Date: date,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAttendace)));
    }

    async DeleteAttendance(ctx, id) {
        const exists = await this.AttendanceExists(ctx, id);
        if (!exists) {
            throw new Error(`The attendance ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    async AttendanceExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    async GetAllAttendances(ctx) {
        const allResults = [];
         const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = AttendanceContract;
