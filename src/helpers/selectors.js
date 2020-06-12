export function getAppointmentsForDay(state, day) {
  let result = [];
  const stateDay = state.days.find((dayObj) => dayObj.name === day);
  if (!stateDay) {
    return result;
  }
  stateDay.appointments.forEach((ID) => {
    const appointment = state.appointments[ID];
    result.push(appointment);
  });
  return result;
}
