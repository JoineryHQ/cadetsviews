<?php
use CRM_Profcond_ExtensionUtil as E;

/**
 * cadetsviews.Updateparticipantstatus API specification (optional)
 * This is used for documentation and validation.
 *
 * @param array $spec description of fields supported by this API call
 *
 * @see https://docs.civicrm.org/dev/en/latest/framework/api-architecture/
 */
function _civicrm_api3_cadetsviews_Updateparticipantstatus_spec(&$spec) {
  $spec['id'] = [
    'api.required' => 1,
    'type' => CRM_Utils_Type::T_INT
  ];
  $spec['status_id'] = [
    'api.required' => 1,
    'type' => CRM_Utils_Type::T_INT
  ];
}

/**
 * Activity.Updateparticipantstatus API
 *
 * @param array $params
 *
 * @return array
 *   API result descriptor
 *
 * @see civicrm_api3_create_success
 *
 * @throws API_Exception
 */
function civicrm_api3_cadetsviews_Updateparticipantstatus($params) {
  $drupalSettings = $settings = \Drupal::config('cadetsviews')->get();
  if (!empty($settings['event_checkin']['participantStatusIds'])) {
    $validParticipantStatusIds = $drupalSettings['event_checkin']['participantStatusIds'];
    if (!in_array($params['status_id'], $validParticipantStatusIds)) {
      throw new API_Exception(/*error_message*/ 'Status ID not allowed by configuration.', /*error_code*/ 'invalid_status_id');    
    }
  }
  
  $result = \Civi\Api4\Participant::update()
    ->setCheckPermissions(FALSE) // Assume we should be allowed if we're here.
    ->addValue('id', $params['id'])
    ->addValue('status_id', $params['status_id'])
    ->execute()
    ->first();

  // Spec: civicrm_api3_create_success($values = 1, $params = [], $entity = NULL, $action = NULL)
  return civicrm_api3_create_success($result, $params, 'Cadetsviews', 'Updateparticipantstatus');
}
