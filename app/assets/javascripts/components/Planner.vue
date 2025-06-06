<template>
  <div>
    <div class="govuk-grid-row">
      <div id="calendar" class="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full print-full-width">
        <Calendar :weeks="leaveAndPay.weeks" :leaveBoundaries="leaveAndPay.leaveBoundaries"
          :natureOfParenthood="natureOfParenthood" :typeOfAdoption="typeOfAdoption"
          :primaryLeaveType="primaryLeaveType" :names="names" :updateLeaveOrPay="updateLeaveOrPay"
          :interactive="interactive" :eligibility="eligibility"/>
      </div>
      <div id="sidebar" class="govuk-grid-column-one-third-from-desktop govuk-grid-column-full print-hide">
        <div id="sidebar-information" tabindex="1">
          <Sidebar :weeks="leaveAndPay.weeks"
            :natureOfParenthood="natureOfParenthood" :typeOfAdoption="typeOfAdoption"
            :primaryLeaveType="primaryLeaveType" :names="names"
            :eligibility="eligibility" :reset="resetIfChanged"/>
        </div>
        <h2 class="govuk-heading-m">Reset the calendar</h2>
        <p>You can reset the calendar to start again.</p>
        <button v-if="interactive"
          class="govuk-button"
          type="button"
          @click="resetIfChanged()"
          data-ga-hit-type="planner_reset"
          data-ga-field-event_category="planner"
          data-ga-field-event_action="reset"
          aria-label="Reset the calendar and remove all changes">
          Reset to start again
        </button>
      </div>
    </div>
    <div class="govuk-grid-row print-hide">
      <div class="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
        <ShareLink :formData="formData" :primary="primary" :secondary="secondary"/>
        <PrintYourPlan />
      </div>
    </div>
  </div>
</template>

<script>
  const { isEqual } = require('lodash')
  const Calendar = require('./Calendar.vue')
  const Sidebar = require('./Sidebar.vue')
  const PrintYourPlan = require('./PrintYourPlan.vue')
  const ShareLink = require('./ShareLink.vue')
  const Weeks = require('../../../lib/weeks')
  const { primaryName, isBirth, shouldSetNewFirstSplWeek, shouldResetFirstSplWeek } = require('../../../../common/lib/dataUtils')

  module.exports = {
    components: {
      Calendar,
      Sidebar,
      PrintYourPlan,
      ShareLink
    },
    computed: {
      names: function () {
        return {
          primary: primaryName(this.natureOfParenthood),
          secondary: 'partner'
        }
      },
      primaryLeaveType: function () {
        return isBirth(this.natureOfParenthood) ? 'maternity' : 'adoption'
      },
      leaveAndPay: function () {
        const weeks = new Weeks({
          natureOfParenthood: this.natureOfParenthood,
          typeOfAdoption: this.typeOfAdoption,
          startWeek: this.startWeek,
          primary: this.primary,
          secondary: this.secondary,
          eligibility: this.eligibility
        })
        return weeks.leaveAndPay()
      }
    },
    methods: {
      updateWeek: function(parent, property, week, checked, leaveType) {
        this.updateFirstSplWeek(parent, week, checked, leaveType)

        const weeks = this[parent][property + 'Weeks']
        if (checked && !weeks.includes(week)) {
          weeks.push(week)
        } else if (!checked && weeks.includes(week)) {
          const index = weeks.indexOf(week)
          weeks.splice(index, 1)
        }
      },
      updateFirstSplWeek: function (parent, selectedWeek, checked, leaveType) {
        const previousWeek = this.primary.firstSplWeek
        if (shouldSetNewFirstSplWeek(checked, parent, leaveType, selectedWeek, previousWeek)) {
          this.primary.firstSplWeek = selectedWeek
        } else if (shouldResetFirstSplWeek(parent, leaveType, selectedWeek, previousWeek)) {
          this.resetFirstSplWeek()
        }
      },
      resetFirstSplWeek: function() {
        this.primary.firstSplWeek = Number.MAX_SAFE_INTEGER
      },
      resetIfChanged: function () {
        const warning = "This will overwrite any leave or pay which you have already entered in the calender."
        if (this.hasBeenEdited() && window.confirm(warning)) {
          this.reset()
        }
      },
      hasBeenEdited: function () {
        return !(
          isEqual(this.primary.leaveWeeks, [0, 1]) &&
          isEqual(this.primary.payWeeks, [0, 1]) &&
          this.secondary.leaveWeeks.length === 0 &&
          this.secondary.payWeeks.length === 0
        )
      }
    }
  }
</script>

<style lang="scss">
  @import "node_modules/govuk-frontend/dist/govuk/settings/colours-applied";

  @mixin sticky() {
    @media not print {
      position: sticky;
      position: -o-sticky;
      position: -webkit-sticky;
      position: -moz-sticky;
      position: -ms-sticky;
    }
  }

  #calendar {
    thead {
      /* Various styling to patch sticky headers. */
      $th-height: 48px;
      th {
        @include sticky();
        z-index: 1;

        height: $th-height;
        box-sizing: border-box;
        top: 0;
      }
    }
  }

  #sidebar {
    @include sticky();
    top: 10px;

    #sidebar-information {
      max-height: calc(100vh - 65px);
      overflow-y: auto;
    }

    .govuk-button {
      margin-top: 5px;
    }
  }
</style>
