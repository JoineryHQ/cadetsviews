<?php
use Drupal\views\ViewExecutable;

/**
 * Implements hook_views_pre_render().
 */
function cadetsviews_views_pre_render(ViewExecutable $view) {
  // Indicate in JS whether user has permission to update.
  $view->element['#attached']['drupalSettings']['cadetsviews']['hasPermission'] = \Drupal::currentUser()->hasPermission('cadetsviews_update_activity_status');

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
}
