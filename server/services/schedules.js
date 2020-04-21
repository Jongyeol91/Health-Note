const { db } = require('../models');
const schedulesController = {};
const moment = require('moment');
const calendarColors = require('../utils/seedColors');

const makeFirstWeekDates = (days, firstDate, times) => {
  let startDay = null;
  const firstDateFormated = moment(firstDate).format('YYYY-MM-DD');
  console.log('firstDateFormated', firstDateFormated);

  switch (moment(firstDate).isoWeekday()) {
    case 1:
      startDay = 1;
      break;
    case 2:
      startDay = 2;
      break;
    case 3:
      startDay = 3;
      break;
    case 4:
      startDay = 4;
      break;
    case 5:
      startDay = 5;
      break;
    case 6:
      startDay = 6;
      break;
    case 7:
      startDay = 7;
      break;
    default:
      break;
  }

  const firstWeekDates = [];
  for (let i = 0; i < days.length; i++) {
    // ex) 선택요일이 수요일인데 수요일 날짜 구할때
    if (startDay === days[i]) {
      const tempString1 =
        firstDateFormated + ' ' + moment(times[i]).format('HH:mm');
      const tempFirstDate1 = moment(tempString1);
      //console.log('tempFirstDate1', tempFirstDate1);
      firstWeekDates.push(tempFirstDate1);
    } else if (startDay > days[i]) {
      // ex) 선택요일이 수요일인데 그 다음주 월요일 구할때
      const tempString2 =
        firstDateFormated + ' ' + moment(times[i]).format('HH:mm');
      tempFirstDate2 = moment(tempString2);
      const nextWeekDayDiff = startDay - days[i];
      tempFirstDate2.add(7 - nextWeekDayDiff, 'days');
      firstWeekDates.push(tempFirstDate2);
    } else if (startDay < days[i]) {
      // ex) 선택요일이 수요일인데 이번주 금요일 구할때
      const tempString3 =
        firstDateFormated + ' ' + moment(times[i]).format('HH:mm');
      const tempFirstDate3 = moment(tempString3);
      tempFirstDate3.add(days[i] - startDay, 'days');
      firstWeekDates.push(tempFirstDate3);
    }
  }
  let sortedArray = firstWeekDates.sort((a, b) => a.valueOf() - b.valueOf());

  //console.log('==========firstWeekDates=====', sortedArray);

  return sortedArray;
};

// 전체 스케줄 날짜 구하기
const makeAllSchedule = async (
  firstWeekDates,
  totalPT,
  foundMemberId,
  times
) => {
  const allSchedule = [];
  const copyFirstWeekDates = []; // 복사
  const copyFirstWeekDates2 = []; // 복사
  const weekNum = Math.floor(totalPT / firstWeekDates.length); // 10 / 3 = 3

  console.log('weekNum', weekNum);

  const remainDayNum = totalPT % firstWeekDates.length;

  console.log('remainDayNun', remainDayNum);

  // 첫 주 요일들의 날짜를 넣는다.
  for (let i = 0; i < firstWeekDates.length; i++) {
    copyFirstWeekDates.push(moment(firstWeekDates[i])); // 복사를 위해 수행
    copyFirstWeekDates2.push(moment(firstWeekDates[i])); // 복사를 위해 수행
    allSchedule.push(moment(firstWeekDates[i]).format()); // 첫 요일들을 담음
  }

  // 중간 주의 요일들을 넣는다.
  for (var i = 0; i < firstWeekDates.length; i++) {
    for (let j = 0; j < weekNum - 1; j++) {
      allSchedule.push(copyFirstWeekDates2[i].add(1, 'weeks').format());
    }
  }

  if (remainDayNum !== 0) {
    // 남은 요일들을 넣는다.
    for (let r = 0; r < remainDayNum; r++) {
      allSchedule.push(copyFirstWeekDates[r].add(weekNum, 'weeks').format());
    }
    allSchedule.sort();
  }

  //console.log('===========allSchedule=========', allSchedule);

  let j = 0;
  const createdAllSchedules = allSchedule.map((cv, i) => {
    // if (j === times.length) {
    //   // EX) 배열로 들어온 월, 수, 금 차례로 넣어주기 위한 장치)
    //   j = 0;
    // }
    // const date =
    //   moment(cv).format('YYYYMMDD') +
    //   ' ' +
    //   moment(times[j++]).format('HHmm');
    // const finalDate = moment(date).format('YYYY-MM-DD HH:mm');

    return {
      startTime: cv,
      memberId: foundMemberId,
      endTime: '0000',
      isFinish: false,
      isTemp: '??',
      day: moment(cv).isoWeekday(),
    };
  });

  return createdAllSchedules;
};

// createdAllSchedules = [date, date, date ...]
const createAllSchedules = async (createdAllSchedules) => {
  console.log('createdAllSchedules', createdAllSchedules);

  const createdDbSchedules = await db.schedule
    .bulkCreate(createdAllSchedules)
    .catch((err) => {
      throw new Error(err);
    });
  return createdDbSchedules;
};

const initialize = async (body) => {
  const { firstDate, times, totalPT, days, phoneNum } = body; // 시작일, 횟수, 요일배열

  console.log(
    'days: ',
    days,
    'date: ',
    moment(firstDate).isoWeekday(),
    'times: ',
    //times,
    //moment(times[0]).format('HHmm'),
    'totalPT: ',
    totalPT
  );

  if (!days.includes(moment(firstDate).isoWeekday())) {
    console.log('시작일이 선택요일에 포함되지 않음');
    //return res.status(400).json({ msg: '시작일이 선택요일에 포함되지 않습니다.' });
    throw new Error();
  }

  try {
    const firstWeekDates = await makeFirstWeekDates(days, firstDate, times);

    const foundMemberId = await db.member.findOne({
      where: { phoneNum: phoneNum },
      attributes: ['id'],
    });

    console.log('foundMemberId', foundMemberId.dataValues.id);

    const allSchedules = await makeAllSchedule(
      firstWeekDates,
      totalPT,
      foundMemberId.dataValues.id,
      times,
    );
    const createdDbSchedules = await createAllSchedules(allSchedules, phoneNum);

    console.log('createdDbSchedules', createdDbSchedules);
    return createdDbSchedules;

  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

// 스케줄 가져오기
const get = async (id) => {
  const allSchedulesOfMember = await db.member
    .findAll({
      where: {
        accountId: id,
      },
      include: {
        model: db.schedule,
      },
      raw: true,
      nest: false,
    })
    .catch((err) => {
      throw new Error(err);
    });

    //console.log(allSchedulesOfMember);

  // const memberSchedules = [];
  // for (let i = 0; i < foundMembersWithSchedules.length; i++) {
  //   if (foundMembersWithSchedules[i].schedule) {
  //     memberSchedules.push({
  //       title: foundMembersWithSchedules[i].name,
  //       start: foundMembersWithSchedules[i].schedule.startTime,
  //       id: foundMembersWithSchedules[i].schedule.scheduleId,
  //       color: calendarColors[3].colors[i].color,
  //       isFinish: foundMembersWithSchedules[i].schedule.isFinish,
  //       memberId: foundMembersWithSchedules[i].id,
  //     });
  //   }
  // }

  // console.log(memberSchedules);

  return allSchedulesOfMember;
};

// 스케줄 삭제
const remove = async (id) => {
  const count = await db.schedule
    .destroy({
      where: { id: id },
    })
    .catch((err) => {
      throw new Error(err);
    });
};

// 스케줄 변경
const update = async (body, id) => {
  const {
    memberId,
    startTime,
    endTime,
    isFinish,
    isReschedule,
    day,
    tooltipText,
  } = body;

  await db.schedule
    .update(
      {
        startTime: startTime, //moment(afterDate + ' ' + afterTime).format('YYYY-MM-DD HH:mm'),
        endTime: endTime,
        isFinish: isFinish,
        isReschedule: isReschedule,
        day: day, //moment(afterDate).isoWeekday(),
        tooltipText: tooltipText,
      },
      {
        where: { id: id, memberId: memberId },
      }
    )
    .catch((err) => {
      throw new Error(err);
    });
};

const create = async (body) => {
  const {
    memberId,
    startTime,
    endTime,
    isFinish,
    isReschedule,
    day,
    tooltipText,
  } = body;

  //startTime = moment(date).format('YYYY-MM-DD HH:mm');
  //console.log('date, memberId!!!!!!!!!!!!!!!!!', date, memberId);
  //day = moment(date).isoWeekday();

  await db.schedule
    .create({
      memberId: memberId,
      startTime: startTime, //moment(afterDate + ' ' + afterTime).format('YYYY-MM-DD HH:mm'),
      endTime: endTime,
      isFinish: isFinish,
      isReschedule: isReschedule,
      day: day, //moment(afterDate).isoWeekday(),
      tooltipText: tooltipText,
    })
    .catch((err) => {
      throw new Error(err);
    });
};

module.exports = { get, update, remove, create, initialize };
