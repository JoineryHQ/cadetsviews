<?php
use Drupal\views\ViewExecutable;

/**
 * Implements hook_views_pre_render().
 */
function cadetsviews_views_pre_render(ViewExecutable $view) {

  // Load settings for this module, which are probably in drupal's settings.php.
  $settings = \Drupal::config('cadetsviews')->get();  
  // If certain settings are defined, and if they match attributes of this view,
  // we'll take action.
  if (
    // If we're configured for a certain view, and this is that view.
    !empty($settings['medicalChartWithButtonsViewId'])
    && $view->id() == $settings['medicalChartWithButtonsViewId']
    // If we're configured for a certain view display, and this is that view display.
    && !empty($settings['medicalChartWithButtonsViewDisplayId'])
    && $view->getDisplay()->display['id'] == $settings['medicalChartWithButtonsViewDisplayId']
    // If we're able to determine the specific activity id in this view
    && $view->argument['id']->argument
  ) {
    // Indicate in JS whether user has permission to update.
    $view->element['#attached']['drupalSettings']['cadetsviews']['hasPermission'] = \Drupal::currentUser()->hasPermission('cadetsviews_update_activity_status');

    \Drupal::service('civicrm')->initialize();
    CRM_Core_Resources::singleton()->addCoreResources();

    // Get relevant activity status ids via civicrm api:
    $medicalChartWithButtonsActivityStatusIds = $settings['medicalChartWithButtonsActivityStatusIds'];
    $optionValues = \Civi\Api4\OptionValue::get()
      ->setCheckPermissions(FALSE)
      ->addSelect('value', 'label')
      ->addWhere('option_group_id:name', '=', 'activity_status')
      ->addWhere('value', 'IN', $medicalChartWithButtonsActivityStatusIds)
      ->execute();
    foreach ($optionValues as $optionValue) {
      // Assign each of these, keyed to ID, for usage in JS.
      $view->element['#attached']['drupalSettings']['cadetsviews']['statusLabels'][$optionValue['value']] = $optionValue['label'];
    }

    // Assign config list of relevant status IDs for usage in JS.
    $view->element['#attached']['drupalSettings']['cadetsviews']['statusIds'] = $medicalChartWithButtonsActivityStatusIds;
    // Assign the current activity ID for usage in JS.
    $view->element['#attached']['drupalSettings']['cadetsviews']['activityId'] = $view->argument['id']->argument;
    // Attach our library of JS and CSS files.
    $view->element['#attached']['library'][] = 'cadetsviews/medicalChartButtons';
  }
  elseif (
    // If we're configured for a certain view, and this is that view.
    !empty($settings['event_checkin']['viewId'])
    && $view->id() == $settings['event_checkin']['viewId']
    // If we're configured for a certain view display, and this is that view display.
    && !empty($settings['event_checkin']['displayId'])
    && $view->getDisplay()->display['id'] == $settings['event_checkin']['displayId']
  ) {
    // If current user doesn't have permission for this stuff, don't bother with any of this.
    if (\Drupal::currentUser()->hasPermission('cadetsviews_update_participant_status')) {
      \Drupal::service('civicrm')->initialize();
      CRM_Core_Resources::singleton()->addCoreResources();

      // Attach our library of JS and CSS files.
      $view->element['#attached']['library'][] = 'cadetsviews/eventCheckin';

      $smarty = CRM_Core_Smarty::singleton();
      $statusGetOptions = civicrm_api3('Participant', 'getoptions', [
        'field' => "participant_status_id",
      ]);
      $statusOptions = $statusGetOptions['values'];
      // Limit status options per config, if configured.
      if (!empty($settings['event_checkin']['participantStatusIds'])) {
        $statusOptions = array_intersect_key($statusOptions, array_flip($settings['event_checkin']['participantStatusIds']));
      }
      // Assign status options to smarty and build template.
      $smarty->assign('statusOptions', $statusOptions);
      $statusControlsMarkup = $smarty->fetch('CRM/Cadetsviews/snippet/eventCheckinStatusControls.tpl');
      // Assign values to drupal settings for JS.
      $view->element['#attached']['drupalSettings']['cadetsviews']['status-controls-markup'] = $statusControlsMarkup;
      $view->element['#attached']['drupalSettings']['cadetsviews']['statusOptions'] = $statusOptions;
    }
  }
}
