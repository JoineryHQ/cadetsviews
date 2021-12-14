# Cadets Views: Custom code-based alterations of Drupal views


Developed for: cadets.org.

Author: Allen Shaw, Joinery

Licensed under [GNU GENERAL PUBLIC LICENSE, Version 2](LICENSE.txt)

## Functionality

Into a given view (per configuration in Drupal's settings.php), which is expected
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

## Configuration:

Configuration is defined through variables in Drupal's settings.php. Available
configurations are these; all are required:

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