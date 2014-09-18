var mongoose = require("mongoose"),
    encrypt = require("../utilities/encryption");

var availabilitySchema = mongoose.Schema({
        employee_id: mongoose.Schema.Types.ObjectId, 
        currDate: Date,
        slot_time: {
            morning_start_time: Date,
            morning_start_time_period: String,
            morning_end_time: Date,
            morning_end_time_period: String,
            afternoon_start_time: Date,
            afternoon_start_time_period: String,
            afternoon_end_time: Date,
            afternoon_end_time_period: String,
            night_start_time: Date,
            night_start_time_period: String,
            night_end_time: Date,
            night_end_time_period: String,
            late_night_start_time: Date,
            late_night_start_time_period: String,
            late_night_end_time: Date,
            late_night_end_time_period: String,
        },
        morning_schedule_time: Date,
        afternoon_schedule_time: Date,
        night_schedule_time: Date,
        late_night_schedule_time: Date,
        is_morning_scheduled: Boolean,
        is_afternoon_scheduled: Boolean,
        is_night_scheduled: Boolean,
        is_late_night_scheduled: Boolean,
        modified_date: Date,
        modified_by: mongoose.Schema.Types.ObjectId
});

var Availability = mongoose.model("Availability", availabilitySchema);