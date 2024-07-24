var DSF_page_change=false;
/**
 * On window load
 */
$(window).on('load', function () {

    //disable cache on ajax
    $.ajaxSetup({ cache: false });

    //get data from json
    $.getJSON("data/nace_rev2.json", function (data) {

        //filter for four digit codes only 
        if ("geolocation" in navigator) {
            
        }
        var filteredData = data.filter(filterFourDigit);

        //the mustache template
        //Accessibility: use `govcy-visually-hidden-error` class to help screen readers understand what the link does
        //Accessibility: in `index.html` used `<caption>` with class `govcy-visually-hidden-error` in our table to read instruction how to use the table
        //Accessibility: in `index.html` overwritten css to implement focus states and gov.cy appearance
        //Accessibility: (NOT used because it spelled greek characters )use `aria-describedby` and ids to help screen readers describe the value on the link
        //var mustacheTemplate = "{{#.}}<tr><th><a id='code-{{Code}}' aria-describedby='desc-{{Code}}' data-code='{{Code}}' class='copy-link' href='#'><span class='govcy-visually-hidden-error'>Click to copy the code with value </span>{{Code}}</a> </th><td id='desc-{{Code}}'><b>Ελληνικά: </b>{{Description_el}} <br><b>English: </b>{{Description_en}}</td></tr>{{/.}}";
        //Accessibility 
        var mustacheTemplate = "{{#.}}<tr><th><a id='code-{{Code}}' data-code='{{Code}}' class='copy-link' href='#'><span class='govcy-visually-hidden-error'>Click to copy the code with value </span>{{Code}}<span class='govcy-visually-hidden-error'>, Description in English \"{{Description_en}}\", description in Greek \"{{Description_el}}\"</span></a> </th>" 
            + "<td id='desc-{{Code}}'><b>Ελληνικά: </b>{{Description_el}} <br><b>English: </b>{{Description_en}}</td></tr>{{/.}}";
        //render using mustache
        var content = Mustache.render(mustacheTemplate, filteredData);

        //render on page
        $("#NACEBody").html(content);

        //register datatable `draw` event handler 
        $('#NICETable').on( 'draw.dt', function () {
            console.log( 'Table event' );
            //register the `click` event that shows copies and shows the modal.
            $('.copy-link').on( 'click', function (event) {
                //prevent the link from going to the 
                event.preventDefault();
                //get code
                var code = $(this).data('code');
                //document must be selected to trigger the copy
                $(this).parent().select();
                //copy the code 
                copyToClipboardModern(code, 
                    //on success show  message that value was copied
                    showToastMessage(code)
                );
              })
              //Accessibility: when page change focus on first result of the page
              //This is done in the `draw` event as now the results have been rendered
              if (DSF_page_change) {
                document.querySelector(".copy-link").focus();
                DSF_page_change=false;
              }
        } );

        //register datatable `page` (page change) event handler 
        $('#NICETable').on( 'page.dt', function () {
            //Accessibility: set the page change flag to trigger whatever need to be done on the `draw` event
            DSF_page_change=true;
           
        } );

        //create datatable
        $('#NICETable').DataTable({
            responsive: true,
            fixedHeader: true,
            info: false,
            ordering: false,
            lengthChange: false,
            autoWidth: false,
            //Accessibility: buttons seem to read better by screen readers
            pagingTag: 'button',
            // paging: false,
            language: {
                "search": "Search <br>",
                "zeroRecords": "No matching records found",
            },
            "pageLength": 10
        });
          
    });

});

/**
 * A function that returns true if the `item.Code` is a four digit number
 * 
 * @param {*} item the object to check for filtering 
 * @returns boolean
 */
function filterFourDigit(item) {
    if (item.Code < 100000) {
      return true;
    }
    return false;
  }

 /**
 * Copies the specified text to the clipboard using the Clipboard API (if supported).
 * Falls back to using document.execCommand("copy") for browsers that do not support the Clipboard API.
 *
 * @param {string} text - The text to be copied to the clipboard.
 * @param {function} successCallback - The callback function to be called on successful copy.
 * @param {function} errorCallback - The callback function to be called on copy failure.
 */
 function copyToClipboardModern(text, successCallback, errorCallback) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
            function () {
                if (successCallback && typeof successCallback === 'function') {
                    successCallback();
                } else {
                    console.log("Text successfully copied to clipboard");
                }
            },
            function (err) {
                if (errorCallback && typeof errorCallback === 'function') {
                    errorCallback(err);
                } else {
                    console.error("Unable to copy text to clipboard", err);
                }
            }
        );
    } else {
        //if browser does not support fallback to older method
        copyToClipboardFallback(text, successCallback, errorCallback);
    }
}


/**
 * Fallback function for copying text to the clipboard using document.execCommand("copy").
 *
 * @param {string} text - The text to be copied to the clipboard.
 * @param {function} successCallback - The callback function to be called on successful copy.
 * @param {function} errorCallback - The callback function to be called on copy failure.
 */
function copyToClipboardFallback(text, successCallback, errorCallback) {
    try {
        var textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        if (successCallback && typeof successCallback === 'function') {
            successCallback();
        } else {
            console.log("Text successfully copied to clipboard");
        }
    } catch (err) {
        if (errorCallback && typeof errorCallback === 'function') {
            errorCallback(err);
        } else {
            console.error("Unable to copy text to clipboard", err);
        }
    }
}

/**
 * Shows a modal stating the value has been copied.
 * 
 * @param {string} code The code tha that was clicked
 */
function showModalMessage(code) {
    //Accessibility: bootrstap modal accessibility on https://getbootstrap.com/docs/5.1/components/modal/#accessibility
    //Accessibility: in `index.html` for modal used `aria-labelledby` and `aria-label` to help screen readers
    const x = window.scrollX;
    const y = window.scrollY
    //create modal from #copyModal
    var myModal = new bootstrap.Modal(document.getElementById('copyModal')
        // set keyboard false and use the `.close-modal` event instead
        ,{keyboard:false,
            backdrop : "static"})
    //set the body value 
    $('#copyModalBody').html("The value <b>" + code + "</b> has been copied.")
    //register the `click` event on `.close-modal` to return focus on clicked anchor 
    //Accessibility: defined custom close function so I can return focus on the element link that was clicked
    $('.close-modal').on( 'click', function () {
        //close
        myModal.hide();
        //Accessibility:focus back in the calling 
        $('#code-'+code).focus();
        // Scroll to the previous location
        window.scrollTo(x, y);
    })
    //show modal
    myModal.show()
}

/**
 * Shows a toast stating the value has been copied.
 * 
 * @param {string} code The code tha that was clicked
 */
function showToastMessage(code) {
    //Accessibility: bootstrap toast accessibility on https://getbootstrap.com/docs/5.1/components/toasts/#accessibility
    //Accessibility: in `index.html` for toast used `aria-live="assertive"` for dynamic content https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
    //Accessibility: in `index.html` for toast used `aria-atomic="true"` to handle announced as a single (atomic) unit, rather than just announcing what was changed https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions#additional_live_region_attributes
    //create toast from
    var toast = new bootstrap.Toast(document.getElementById('liveToast'))
    
    //set the body value 
    $('#toast-body').html("The value <b>" + code + "</b> has been copied.")
    //show toast
    toast.show()

}

