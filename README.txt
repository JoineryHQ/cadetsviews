# Cadets Views: Custom code-based alterations of Drupal views


Developed for: cadets.org.

Author: Allen Shaw, Joinery

Licensed under [GNU GENERAL PUBLIC LICENSE, Version 2](LICENSE.txt)

## Functionality

This module supports two types of specialized behavior on Drupal Views:

### "Medical Chart" activity status updates

Into a given view display (per configuration in Drupal's settings.php), which is expected
to represent a single CiviCRM activity, inject functionality along these lines:

* Assume the existence of, and identify, the html element
`<div id="cadetsviews-activity-status" data-cadetsviews-activity-status-id="N"/>`
where N is the numeric ID of the activity status; this element is expected to
exist in the output of the given view.
* Replace this element with a collection of buttons, one for each of the possible statuses that
may be held by the given activity.
* Each button has 2 durable states: Selected and Unselected, as well as a temporary In-Progress state. (These are indicated by CSS class names; developers may wish to examine the DOM.)
* Only one button will have the Selected state at any given time.
* Upon loading the page, the button indicating the current status will have the
Selected state; the others will be unselected.
* The user may click (or tap) any unselected button to change the status; such action will:
  * Set all buttons to the In-Progress state, indicating that a button
    has been pressed and we're awaiting a response.
  * Send a request via CiviCRM'S ajax api to change the activity status to that
    of the selected button, and wait for a response to this request.
* Receipt of a response for this ajax-based status change request will trigger
  these changes:
  * Remove the In-Progress state from all buttons.
  * Apply the Selected state to the button representing the currently saved status.
  * Apply the Unselected state to other buttons.

### "Event Check-in" participant status updates
Into a given view (per configuration in Drupal's settings.php), which is expected
to represent a collection of CiviCRM participant records, inject functionality along these lines:

* Assume that the View output is in tabular format.
* In each row of the output table, assume the existence of, and identify, an html element `<a href="#" data-cadetsviews-participant-id="N" class="cadetsviews-update-participant-status">Attended</a>`
where N is the numeric ID of the row's participant record; this field is expected to
exist in the output of the given view.
* Attach a click handler to this element, so that, when this element is clicked, a sufficiently permissioned user will see: A pop-up offering various Participant Status options, each as a clickable link.
* When the user clicks one of these statuses, an API call is sent to CiviCRM to update this participant record with the selected status.
* Any errors from this API call are displayed to the user within the given table row.
* While one status change request is being processed, the user can continue making similar requests on other rows (i.e., the user need not wait for completion of one request before moving on to make another).
* Each participant record will be assigned a visual state during certain portions of the workflow, to help the user be aware of the state of each status change request:
  * Active: The list of participant status options is being displayed for this participant record.
  * Sent: A request to change the status of this participant record has been sent to the server.
  * Saved: The requested status change was succesfully made on the server; this state indicator will be un-set after a few seconds.
  * None: The default state when none of the above states are relevant for this participant record.


## Configuration:

Configuration is defined through variables in Drupal's settings.php. Available
configurations are as follows, for each of the types of specialized behavior:
### "Medical Chart" activity status updates

Settings are defined by array key/value pairs directly within the `$config['cadetsviews']` array:

```
$config['cadetsviews'] = [
  // The system ID of the view display on which we should inject the status buttons.
  'medicalChartWithButtonsViewDisplayId' => '',           // For example, 'page_1'.

  // The machine name of the view containing the above-named view display.
  'medicalChartWithButtonsViewId' => '',                  // For example, 'civicrm_activity_test'

  // CiviCRM activity status IDs for which buttons should be created. Buttons
  // for each of these statuses will be displayed, in the order given here.
  'medicalChartWithButtonsActivityStatusIds' => [],       // For example, [3,2,1]
];
```
### "Event Check-in" participant status updates

Settings are defined by array key/value pairs within the `$config['cadetsviews']['event_checkin']` array:

```
$config['cadetsviews'] = [
  // Configurations for event_checkin behaviors:
  'event_checkin' => [
    // Which view.
    'viewId' => '',                         // For example, 'camp_check_in'.
    // Which display in this view.
    'displayId' => '',                      // For example, 'page_1'.
    // Valid participant status IDs (set an empty array to allow all statuses).
    'participantStatusIds' => [],        // For example, [1,2].
  ]
];
```


## Support
![Joinery](/images/joinery-logo.png)

Joinery provides services for Drupal and CiviCRM including custom extension development, training, data migrations, and
more. We aim to keep this project in good working order, and will do our best to respond appropriately to issues reported
on its [github issue queue](https://github.com/JoineryHQ/viper_views/issues). In addition, if you require urgent or
highly customized improvements to this extension, we may suggest conducting a fee-based project under our standard
commercial terms.  In any case, the place to start is the [github issue queue](https://github.com/JoineryHQ/viper_views/issues) --
let us hear what you need and we'll be glad to help however we can.

And, if you need help with any other aspect of Drupal or CiviCRM -- from hosting to custom development to strategic consultation
and more -- please contact us directly via https://joineryhq.com