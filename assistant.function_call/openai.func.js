import { events } from './dummy.js';
import { getEventsFromAllCalendars, insertEvent } from './googleCalendar.js';

const nameEmailMap = {
	'hmu332233@gmail.com': ['민웅'],
};

const convertNamesToEmails = ({ names }) => {
	return names
		.map((name) =>
			Object.keys(nameEmailMap).filter((email) =>
				nameEmailMap[email].includes(name),
			),
		)
		.flat();
};

// 예시 데이터
const roomMap = {
	'1_ROOM': ['1층 회의실'],
};

const getOfficialMeetingRoomNames = ({ meetingRoomNames }) => {
	return meetingRoomNames
		.map((name) =>
			Object.keys(roomMap).filter((roomName) =>
				roomMap[roomName].includes(name),
			),
		)
		.flat();
};

/**
 * @typedef {Object} CalendarEvent
 * @property {string} date - YYYY-MM-DD 형식의 특정 날짜.
 * @property {string[]} emails - 이벤트와 관련된 사람들의 이메일 주소 목록. (ex. ['mark.han@goorm.io']
 * @property {string[]} meetingRooms - 이벤트 필터링에 사용될 회의실 이름 목록. (ex. ['DRUCKER ROOM'])
 */

/**
 * Google Calendar에서 특정 날짜에 관련된 이메일 주소 및 회의실 이름 목록에 따라 이벤트를 검색합니다.
 *
 * @param {CalendarEvent} eventParams - 이벤트 검색에 필요한 매개변수.
 * @returns {Promise<Object[]>} 지정된 날짜와 조건에 맞는 Calendar 이벤트 목록을 반환하는 Promise.
 */
const getCalendarEvents = async ({ date, emails, meetingRooms }) => {
	const allEvents = await getEventsFromAllCalendars({
		date,
		room: meetingRooms,
		attendees: emails,
	});
	console.log('allEvents', allEvents);

	console.log(date, meetingRooms, emails);
	return allEvents.filter((event) => {
		const isAttendee = emails
			? emails.some((email) => event.attendees.includes(email))
			: true;
		const isMeetingRoom = meetingRooms
			? meetingRooms.some((room) => event.meetingRoom.includes(room))
			: true;
		return isAttendee && isMeetingRoom;
	});
};

/**
 *
 * @param {Object} CalendarEventForInsert
 * @property {string} calendarId - 캘린더 아이디
 * @property {string} summary - 이벤트 이름
 * @property {string} start - 시작 시간
 * @property {string} end - 종료 시간
 * @property {string[]} emails - 이벤트와 관련된 사람들의 이메일 주소 목록. (ex. ['
 * @property {string[]} meetingRooms - 이벤트 필터링에 사용될 회의실 이름 목록. (ex. ['DRUCKER ROOM'])
 */
const insertCalendarEvents = async ({
	calendarId,
	summary,
	start,
	end,
	emails,
	meetingRooms,
}) => {
	const res = await insertEvent(calendarId, {
		summary,
		start,
		end,
		attendees: [...meetingRooms, ...emails].reduce((email, acc) => {
			acc.push({ email });
			return acc;
		}, {}),
	});

	return res;
};

const createCalendarEvent = async ({} = {}) => {
	return true;
};

export const functionMap = {
	createCalendarEvent,
	getCalendarEvents,
	getOfficialMeetingRoomNames,
	convertNamesToEmails,
	insertCalendarEvents,
};
