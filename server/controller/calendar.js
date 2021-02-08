const moment = require('moment');
const db = require('../database');

const cal = (request, response) => {
  const calendarMonths = [];
  const dateObject = moment();
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

  const { propertyId } = request.params;
  db.query(`SELECT startDate, endDate FROM bookings WHERE propertyId = ${propertyId}`)
    .then((data) => {
      data.rows.forEach((date) => {
        const dateStart = moment(date.startdate, 'MM-DD-YYYY');
        const dateEnd = moment(date.enddate, 'MM-DD-YYYY');

        const dayStart = +dateStart.format('D');
        const monthStart = dateStart.format('MMMM');
        const monthEnd = dateEnd.format('MMMM');
        const yearStart = dateStart.year();
        const yearEnd = dateEnd.year();

        const daysDiff = dateEnd.diff(dateStart, 'days');
        const firstDay = +dateStart.startOf('month').format('d');
        const firstEndDay = +dateEnd.startOf('month').format('d');
        const firstStartIndex = firstDay + dayStart - 1;

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
      response.send(calendarMonths);
    })
    .catch(error => response.sendStatus(404));
};

module.exports = cal;
