CRM.$(function($) {
  if (!drupalSettings.cadetsviews.activityId) {
    // If activity id is not set, there's nothing we can do, so just exit.
    return;
  }

  // Shorthand to drupal messaging api
  var messages = new Drupal.Message();
  // Global var for our own message Id. We only want to display one message at
  // a time, so we'll remove this message before posting our next, if any.
  var messageId;

  /**
   * Set all buttons to the correct state for a given status.
   * @param Int statusId CiviCRM activity status id. If none given, all buttons are set to 'unselected' state.
   * @returns void
   */
  var setButtonStatus = function setButtonStatus(statusId) {
    // Mark all buttons as unselected.
    $('div.cadetsviews-status-button').removeClass('cadetsviews-status-button-inprogress');
    $('div.cadetsviews-status-button').removeClass('cadetsviews-status-button-selected');
    $('div.cadetsviews-status-button').addClass('cadetsviews-status-button-unselected');
    if (statusId) {
      // Mark the given 'status' button as selected.
      $('div.cadetsviews-status-button[data-cadetsviews-button-status-id="' + statusId +'"]').addClass('cadetsviews-status-button-selected');
      $('div.cadetsviews-status-button[data-cadetsviews-button-status-id="' + statusId +'"]').removeClass('cadetsviews-status-button-unselected');
    }
  };

  /**
   * Click handler for all status buttons.
   */
  var statusButtonClick = function statusButtonClick(e) {
    // if this button has in-progresss or selected classes, don't respond to clicks.
    if (
      $(this).hasClass('cadetsviews-status-button-inprogress') ||
      $(this).hasClass('cadetsviews-status-button-selected')
    ) {
      return;
    }

    // Mark all buttons as in-progress
    $('div.cadetsviews-status-button').addClass('cadetsviews-status-button-inprogress');

    // update status with civicrm ajax api:
    CRM.api4('Activity', 'update', {
      where: [["id", "=", drupalSettings.cadetsviews.activityId]],
      values: {"status_id":$(this).data('cadetsviews-button-status-id')},
      reload: true,
    }).then(function(result) {
      handleStatusButtonAjaxResponse(result);
    }, function(error) {
      handleStatusButtonAjaxError(error);
    });
  };
  
  var setMessage = function setMessage(messageText, properties) {
    if (typeof properties == 'undefined') {
      properties = {};
    }
    // Remove any message we've posted.
    if (messageId) {
      messages.remove(messageId);
    }
    // Post this message with the given properties.
    messageId = messages.add(messageText, properties);
  };

  /**
   * Process ajax non-error response from civicrm ajax api.
   */
  var handleStatusButtonAjaxResponse = function handleStatusButtonAjaxResponse(result) {
    // Get the newly defined status id; then 
    // update button states accordingly
    // and display a message that that the status was saved.
    var updatedStatusId = result[0].status_id;
    setButtonStatus(updatedStatusId);
    setMessage('Status updated to: ' + drupalSettings.cadetsviews.statusLabels[updatedStatusId]);
  };

  /**
   * Process ajax error response from civicrm ajax api.
   */
  var handleStatusButtonAjaxError = function handleStatusButtonAjaxError(error) {
    // Display an error message.
    setMessage(error.error_message, {type: 'error'});
    // We don't know what to do now; to allow the user some control, set all buttons to "unselected".
    setButtonStatus();
  };

  // Find the location where we should inject buttons.
  var statusMarker = $('div#cadetsviews-activity-status');
  // Note the current status Id.
  var statusId = statusMarker.data('cadetsviews-activity-status-id');

  // Insert all our buttons in order.
  for (var i in drupalSettings.cadetsviews.statusIds) {
    var buttonStatusId = drupalSettings.cadetsviews.statusIds[i];
    var content = '<div class="cadetsviews-status-button cadetsviews-status-button-unselected" data-cadetsviews-button-status-id="' + buttonStatusId + '">' + drupalSettings.cadetsviews.statusLabels[buttonStatusId] + '</div>';
    statusMarker.before(content);
  }
  // Define a click handler for all of our buttons.
  $('div.cadetsviews-status-button').click(statusButtonClick);
  // Remove the status marker as it's no longer needed.
  statusMarker.remove();

  // Set states for all buttons based on current status id.
  setButtonStatus(statusId);
});