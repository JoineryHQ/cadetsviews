# Cadets Views: Custom code-based alterations of Drupal views


Developed for: cadets.org.

Author: Allen Shaw, Joinery

Licensed under [GNU GENERAL PUBLIC LICENSE, Version 2](LICENSE.txt)

## Functionality

Into a given view (per configuration in Drupal's settings.php), which is expected
to represent a single CiviCRM activity, inject functionality along these lines:

* Assume the existence of, and identify, the html element 
`<div id="cadetsviews-activity-status" data-cadetsviews-activity-status-id="N"/>`; 
this element is expected to exist in the output of the given view.
* Replace this element with 3 buttons, one for each of the possible statuses that 
may be held by the given activity.
* Each button has 2 states: selected and unselected.  (These are indicated by 
CSS class names, e.g. "status-selected" and "status-unselected".) 
* Only one button will have the Selected state at any given time.
* Upon loading the page, the button indicating the current status will have the 
Selected state; the other 2 will be unselected.
* The user may click (or tap) any unselected button to change the status; such action will 
  * add a CSS class name to the button (e.g. "status-change-requested") indicating that it has been pressed and is awaiting a response; Justin may want to style such buttons in a way that provides feedback to the user regarding this "pending request" status.
  * send a request via CiviCRM'S ajax api to change the activity status to that of the selected button, and wait for a response to this request.
* Receipt of a response for this ajax-based status change request will trigger these changes:
  * remove the above-mentioned CSS class name (e.g. "status-change-requested") from all buttons
  * set the button states so that the currently saved status of the activity is reflected by assigning the selected state to only one button. 


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