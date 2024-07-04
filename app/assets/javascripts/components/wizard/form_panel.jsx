import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Panel from './panel.jsx';
import DatePicker from '../common/date_picker.jsx';
import Calendar from '../common/calendar.jsx';
import CourseDateUtils from '../../utils/course_date_utils.js';

// Utility function for safe property access and transformation
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}

const FormPanel = ({ course, shouldShowSteps, updateCourse, isValid, persistCourse, noDates }) => {
  const noDatesRef = useRef(null);

  const setNoBlackoutDatesChecked = useCallback(() => {
    const { checked } = noDatesRef.current;
    const toPass = { ...course, no_day_exceptions: checked };
    updateCourse(toPass);
  }, [course, updateCourse]);

  const updateCourseDates = useCallback((valueKey, value) => {
    const updatedCourse = CourseDateUtils.updateCourseDates(course, valueKey, value);
    updateCourse(updatedCourse);
  }, [course, updateCourse]);

  const saveCourse = useCallback(() => {
    if (isValid) {
      persistCourse(course.slug);
      return true;
    }
    alert(I18n.t('error.form_errors'));
    return false;
  }, [isValid, persistCourse, course.slug]);

  const nextEnabled = useCallback(() => {
    return (__guard__(course.weekdays, x => x.indexOf(1)) >= 0)
           && (__guard__(course.day_exceptions, x => x.length) > 0 || course.no_day_exceptions);
  }, [course.weekdays, course.day_exceptions, course.no_day_exceptions]);

  const dateProps = CourseDateUtils.dateProps(course);

  const step1 = shouldShowSteps
    ? <h2><span>1.</span><small>{I18n.t('wizard.confirm_dates')}</small></h2>
    : <p>{I18n.t('wizard.confirm_dates')}</p>;

  const rawOptions = (
    <div>
      <div className="course-dates__step">
        {step1}
        <div className="vertical-form full-width">
          <DatePicker
            onChange={updateCourseDates}
            value={course.start}
            value_key="start"
            editable={true}
            validation={CourseDateUtils.isDateValid}
            label="Course Start"
          />
          <DatePicker
            onChange={updateCourseDates}
            value={course.end}
            value_key="end"
            editable={true}
            validation={CourseDateUtils.isDateValid}
            label="Course End"
            date_props={dateProps.end}
            enabled={Boolean(course.start)}
          />
        </div>
      </div>
      <hr />
      <div className="course-dates__step">
        <p>{I18n.t('wizard.assignment_description')}</p>
        <div className="vertical-form full-width">
          <DatePicker
            onChange={updateCourseDates}
            value={course.timeline_start}
            value_key="timeline_start"
            editable={true}
            validation={CourseDateUtils.isDateValid}
            label="Assignment Start"
            date_props={dateProps.timeline_start}
          />
          <DatePicker
            onChange={updateCourseDates}
            value={course.timeline_end}
            value_key="timeline_end"
            editable={true}
            validation={CourseDateUtils.isDateValid}
            label="Assignment End"
            date_props={dateProps.timeline_end}
            enabled={Boolean(course.start)}
          />
        </div>
      </div>
      <hr />
      <div className="wizard_form course-dates course-dates_step">
        <Calendar
          course={course}
          editable={true}
          save={true}
          setAnyDatesSelected={() => {}}
          setBlackoutDatesSelected={() => {}}
          calendarInstructions={I18n.t('wizard.calendar_instructions')}
          updateCourse={updateCourse}
        />
        <label>
          {I18n.t('I have no class holidays')}
          <input
            type="checkbox"
            onChange={setNoBlackoutDatesChecked}
            ref={(checkbox) => {
              noDatesRef.current = checkbox;
              if (noDates) {
                noDates.current = checkbox;
              }
            }}
          />
        </label>
      </div>
    </div>
  );

  return (
    <Panel
      course={course}
      shouldShowSteps={shouldShowSteps}
      updateCourse={updateCourse}
      isValid={isValid}
      raw_options={rawOptions}
      nextEnabled={nextEnabled}
      saveCourse={saveCourse}
      helperText={I18n.t('wizard.select_dates_and_continue')}
    />
  );
};

FormPanel.propTypes = {
  course: PropTypes.object.isRequired,
  shouldShowSteps: PropTypes.bool,
  updateCourse: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
  persistCourse: PropTypes.func.isRequired,
  noDates: PropTypes.shape({ current: PropTypes.object })
};

export default FormPanel;
