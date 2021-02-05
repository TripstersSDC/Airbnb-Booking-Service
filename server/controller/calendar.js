const moment = require('moment');
const { Booking } = require('../model');

const cal = (req, res) => {
  const calendarMonths = [];
  const dateObject = moment();
  // generates calendar of up to two years from current date
  for (let i = 0; i < 24; i += 1) {
    const firstDayOfMonth = () => {
      const firstDay = moment(dateObject).startOf('month').format('d');
      return firstDay;
    };

    const blanks = [];
    for (let j = 0; j < firstDayOfMonth(); j += 1) {
      blanks.push(null);
    }

    const days = [];
    for (let k = 1; k <= dateObject.daysInMonth(); k += 1) {
      days.push(k);
    }

    calendarMonths.push({
      month: dateObject.format('MMMM'),
      year: dateObject.year(),
      days: [...blanks, ...days.map((day) => ({ day, avail: true }))],
    });
    dateObject.add(1, 'M');
  }

  const { propertyId } = req.params;
  Booking.find({ propertyId })
    .then((data) => {
      // legacy: only 2 Bookings per Property in DB
      // for each Booking, calculate the dates on the calendar that should are already booked
      data.forEach(({ date }) => {
        // moment expects start/end to be in "MM-DD-YYYY"
        console.log(`date ${JSON.stringify(date)}`);

        const dateStart = moment(date.start, 'MM-DD-YYYY');
        const dateEnd = moment(date.end, 'MM-DD-YYYY');
        console.log(`dateStart ${JSON.stringify(dateStart)}`);
        console.log(`dateEnd ${JSON.stringify(dateEnd)}`);

        const dayStart = +dateStart.format('D');
        const monthStart = dateStart.format('MMMM');
        const monthEnd = dateEnd.format('MMMM');
        const yearStart = dateStart.year();
        const yearEnd = dateEnd.year();

        const daysDiff = dateEnd.diff(dateStart, 'days');
        console.log(`daysDiff ${daysDiff}`);
        const firstDay = +dateStart.startOf('month').format('d');
        const firstEndDay = +dateEnd.startOf('month').format('d');
        const firstStartIndex = firstDay + dayStart - 1;

        // check if booking goes thru end of one month and into next
        if (monthStart !== monthEnd) {
          const daysInFirstMonth = dateStart.daysInMonth() - (dayStart - 1);
          const daysInSecondMonth = daysDiff - daysInFirstMonth;
          const firstEndIndex = firstEndDay;

          calendarMonths.forEach((calendar) => {
            const { days, month, year } = calendar;
            if (month === monthStart && year === yearStart) {
              for (let i = firstStartIndex; i < firstStartIndex + daysInFirstMonth; i += 1) {
                days[i].avail = false;
              }
            } else if (month === monthEnd && year === yearEnd) {
              for (let i = firstEndIndex; i < firstEndIndex + daysInSecondMonth; i += 1) {
                days[i].avail = false;
              }
            }
          });
        } else {
          calendarMonths.forEach((calendar) => {
            const { days, month, year } = calendar;
            if (month === monthStart && year === yearStart) {
              for (let i = firstStartIndex; i < firstStartIndex + daysDiff; i += 1) {
                days[i].avail = false;
              }
            }
          });
        }
      });
      res.send(calendarMonths);
    });
};

module.exports = cal;
