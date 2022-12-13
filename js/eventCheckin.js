CRM.$(function($) {

  // The view must be in a tabular format, and must contain status links with 
  // certain attributes. Otherwise we won't bother with any of this.
  if (!($('a.cadetsviews-update-participant-status[data-cadetsviews-participant-id]').length)) {
    // No "status" links found. Quit.
    return;
  }
  if (!($('a.cadetsviews-update-participant-status[data-cadetsviews-participant-id]').closest('tr'))) {
    // No <tr> tags around the "status" links. Quit.
    return;
  }
  
  // Append html content to be used on this page. (This content was parsed from 
  // the smary template 'CRM/Cadetsviews/snippet/eventCheckinStatusControls.tpl'
  // in cadetsviews_views_pre_render().)
  CRM.$('body').append(drupalSettings.cadetsviews['status-controls-markup']);
  
  // A single scope-wide variable to store the participant id currently being edited.
  var activeParticipantId = 0;
  // An array of up to one error message per participant id.
  var participantStatusErrorMessages = {};
  
  var hideControls = function hideControls() {
    $('#cadetsviews-event-checkin-status-controls').hide();
    // Clear the active participant id variable since we're no longer working with
    // any specific participant.
    activeParticipantId = 0;
  }
  
  var displayControls = function displayControls (clickedStatusElement) {
    // We're going to clone our template div into a new div. But first, make sure
    // no such new div already exists.
    $('#cadetsviews-event-checkin-status-controls').remove();
    // Now clone it and change the id.
    var elControls = $('#cadetsviews-event-checkin-status-controls-template').clone(true, true);
    elControls.attr('id', 'cadetsviews-event-checkin-status-controls');
    // Inject our status controls div just before the clicked "status" link.
    $(clickedStatusElement).before(elControls);
    // Display the controls.
    elControls.show();
    // Clear state on any other rows having "active" status.
    $('tr[data-cadetsviews-event-checkin-state="active"] a.cadetsviews-update-participant-status').each(function(idx, el) {
      var participantId = $(el).data('cadetsviews-participant-id');
      setState(participantId, '');
    });
    
    // indicate current status value in options:
    var currentStatusName = $(clickedStatusElement).html();
    $('#cadetsviews-event-checkin-status-controls a.cadetsviews-event-checkin-set-status').each(function(idx, el){
      if (currentStatusName == $(el).html()) {
        $(el).addClass('cadetsviews-event-checkin-set-status-is-active');
      }
      else {
        $(el).removeClass('cadetsviews-event-checkin-set-status-is-active');        
      }
    })
  }
  
  var initializeErrorMarker = function initializeErrorMarker(participantId) {
    // Define a unique id for the new error marker.
    var errorMarkerId = 'cadetsviews-event-checkin-error-marker-'+ participantId;
    // Remove any such existing error marker; we don't want to create multiple for a single participant id.   
    $('#'+ errorMarkerId).remove();

    // If there's an error message for this participant id, create an error marker.
    // (If not, we don't need an error marker.)
    if (participantStatusErrorMessages[participantId]) {
      // Start with a clone of the templated marker from injected html.
      var elErrorMarker = $('#cadetsviews-event-checkin-error-marker-template').clone();
      // Update the id for this clone.
      elErrorMarker.attr('id', errorMarkerId);
      // Update the participant id data for this clone.
      elErrorMarker.attr('data-cadetsviews-participant-id', participantId);
      // Insert the clone after the "status" link for this participant.
      var elLink = getParticipantElement(participantId, 'a');
      elLink.after(elErrorMarker);
      // Assign the click handler for the new marker.
      $(elErrorMarker).click(errorMarkerClick);      
    }
  }
  
  var displayError = function displayError(clickedErrorMarkerElement) {
    // We only have one error viewer. For each clicked error marker, we'll move
    // that viewer into position, populate the error message, and display the viewer.
    // (This means we only show an error for one marker at a time.)

    // Get the participant id from the clicked error marker data.
    var participantId = $(clickedErrorMarkerElement).data('cadetsviews-participant-id');
    // Get the error message from scope-wide errors array.
    var errorMessage = participantStatusErrorMessages[participantId];
    
    // Place the error viewer just after our clicked error marker.
    $(clickedErrorMarkerElement).before($('#cadetsviews-event-checkin-error-viewer'));
    // Populate the error message.
    $('#cadetsviews-event-checkin-error-message').html(errorMessage);
    // Show the error viewer.
    $('#cadetsviews-event-checkin-error-viewer').show();
  }
  
  var hideError = function hideError() {
    // Hide the error viewer and clear the error message.
    $('#cadetsviews-event-checkin-error-viewer').hide();    
    $('#cadetsviews-event-checkin-error-message').html('');
  }

  var setState = function setState(participantId, state) {
    // Set the given state for both the tr and td elements for the "status" link
    // on the given participant-id-row.
    var elTr = getParticipantElement(participantId, 'tr');
    elTr.attr('data-cadetsviews-event-checkin-state', state);
    var elTd = getParticipantElement(participantId, 'td');
    elTd.attr('data-cadetsviews-event-checkin-state', state);
  }
  
  var statusClick = function statusClick(e) {
    e.preventDefault();
    // We only have one controls div. For any given participant "status" link,
    // we'll move that div into place, update its contents. This means we can
    // only display the controls for on participant-status-link at a time.

    // Display the controls.
    displayControls(this);
    activeParticipantId = $(this).data('cadetsviews-participant-id');
    setState(activeParticipantId, 'active')
  }
  $('a.cadetsviews-update-participant-status').click(statusClick);

  /**
   * Process ajax non-error response from civicrm ajax api.
   */
  var handleStatusButtonAjaxResponse = function handleStatusButtonAjaxResponse(result, apiParams) {
    // Handle api3 'is_error' responses:
    if (result.is_error) {
      handleStatusButtonAjaxError(result, apiParams);
      return;
    }
    // Update link text to new status label.
    var statusId = result.values.status_id
    var statusLabel = drupalSettings.cadetsviews['statusOptions'][statusId];
    var elLink = getParticipantElement(apiParams.id, 'a');
    elLink.html(statusLabel);
    // Set state to saved.
    setState(apiParams.id, 'saved');
    // after 2 seconds, clear the row state.
    setTimeout(function(){setState(apiParams.id, '');}, 2000);
  };

  /**
   * Process ajax error response from civicrm ajax api.
   */
  var handleStatusButtonAjaxError = function handleStatusButtonAjaxError(error, apiParams) {
    // Record the error for this participant id.
    participantStatusErrorMessages[apiParams.id] = 'Error setting status to ' + drupalSettings.cadetsviews['statusOptions'][apiParams.status_id] + ': ' + error.error_message;
    // initialize error marker for this row.
    initializeErrorMarker(apiParams.id);
    // Clear the row state.
    setState(apiParams.id, '');
  };

  var statusControlClick = function statusControlClick(e) {
    e.preventDefault();
    // Clear any errors for this participant and re-initialize the error marker.
    participantStatusErrorMessages[activeParticipantId] = null;
    initializeErrorMarker(activeParticipantId);
    
    // update status with civicrm ajax api:`
    var apiParams = {
      "id": activeParticipantId,
      "status_id": $(this).data('cadetsviews-event-checkin-set-status-id')
    };
    CRM.api3('cadetsviews', 'updateparticipantstatus', apiParams).then(function(result) {
      handleStatusButtonAjaxResponse(result, apiParams);
    }, function(error) {
      handleStatusButtonAjaxError(error, apiParams);
    });
  
    // Update row state = 'sent'
    setState(activeParticipantId, 'sent')
    // Hide status update controls.
    hideControls();
  }
  $('a.cadetsviews-event-checkin-set-status').click(statusControlClick);

  var statusControlCancelClick = function statusControlCancelClick(e) {
    e.preventDefault();
    // Clear the row state since we're not working with this row anymore.
    setState(activeParticipantId, '')
    // Hide the status update controls.
    hideControls();
  }
  $('div#cadetsviews-event-checkin-status-controls-cancel').click(statusControlCancelClick);
  
  var errorCloseClick = function errorCloseClick(e) {
    e.preventDefault();
    hideError();
  }
  $('div#cadetsviews-event-checkin-error-viewer-close').click(errorCloseClick);

  var errorMarkerClick = function errorMarkerClick(e) {
    e.preventDefault();
    displayError(this);
  }
  
  var getParticipantElement = function getParticipantElement(participantId, type) {
    var elLink = $('a.cadetsviews-update-participant-status[data-cadetsviews-participant-id=' + participantId + ']');
    switch (type) {
      case 'a':
        return elLink;
        break;
      case 'tr': 
        return elLink.closest('tr');
        break;
      case 'td': 
        return elLink.closest('td');
        break;
    }
  }
});
