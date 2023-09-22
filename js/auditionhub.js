jQuery(document).ready(function ($) {
  // Move views result header below filter form.
  jQuery('form.views-exposed-form').parent().find('header').insertAfter('form.views-exposed-form').show();
  
  // Determine a "csv download" url based on submitted filters (if any), and 
  // insert a link to that url.
  var insertCsvPath = '/audition.csv';
  var url = new URL(window.location.href);
  var csvTargetUrl = url.origin + url.pathname + insertCsvPath + url.search
  jQuery('form.views-exposed-form').parent().find('header').prepend('<a id="auditionhub-csv-download-link" href="'+ csvTargetUrl +'" class="btn-Cadets-download"><i class="fa-regular fa-file-arrow-down"></i>&nbsp;Download</a>');

});
