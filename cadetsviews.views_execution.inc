<?php
use Drupal\views\ViewExecutable;
use Drupal\views\Plugin\views\query\QueryPluginBase;

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
  ) {
    \Drupal::service('civicrm')->initialize();
    CRM_Core_Resources::singleton()->addCoreResources();
    
  }
}