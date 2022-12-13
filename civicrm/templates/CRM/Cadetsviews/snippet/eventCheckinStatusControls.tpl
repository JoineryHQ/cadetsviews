<div id="cadetsviews-event-checkin-status-controls">
  <div id="cadetsviews-event-checkin-status-controls-cancel">X</div>
  {foreach from=$statusOptions key=statusId item=statusLabel}
  <a href="#" data-cadetsviews-event-checkin-set-status-participant-id="" data-cadetsviews-event-checkin-set-status-id="{$statusId}" class="cadetsviews-event-checkin-set-status">{$statusLabel}</a>
  {/foreach}
</div>

<div id="cadetsviews-event-checkin-error-viewer">
  <div id="cadetsviews-event-checkin-error-viewer-close">X</div>
  <div id="cadetsviews-event-checkin-error-message"></div>
</div>

<i id="cadetsviews-event-checkin-error-marker-template" class="cadetsviews-event-checkin-error-marker crm-i fa-exclamation-triangle"></i>
