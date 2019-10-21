let autocomplete, errorMessage;

let addressData = {
    Address: '',
    StreetNumber: '',
    Route: '',
    City: '',
    State: '',
    StateCode: '',
    PostalCode: '',
    Country: ''
};

function initialize() {
    autocomplete = new google.maps.places.Autocomplete(
        $('#addressSearch')[0], { types: ['address'] }
    );
    autocomplete.setFields(['address_component']);
    autocomplete.addListener('place_changed', placeChanged);
}

$(document).ready(function () {
    initialize();

    $("#AdressSearchForm").validate();

    $(':input[id="addressSearch"]').rules("add", {
        minlength: 4,
        checkSearchValue: true,
        checkSearchData: true,
        checkState: true
    });

    $.validator.addMethod(
        "checkState",
        function (value, element) {
            return (addressData.State === "Illinois" || addressData.StateCode === "IL")
                || (addressData.State === "Georgia" || addressData.StateCode === "GA")
                || (addressData.State === "Wisconsin" || addressData.StateCode === "WI");
        },
        "Sorry, we are currently only lending in IL, GA and WI"
    );

    $.validator.addMethod(
        "checkSearchData",
        function (value, element) {
            let checkState = value.includes(addressData.State) || value.includes(addressData.StateCode),
                checkPostalCode = value.includes(addressData.PostalCode);
            if (checkState && checkPostalCode) {

                addressData.Address = addressData.Address.replace(addressData.State, '')
                    .replace(addressData.StateCode, '')
                    .replace(addressData.PostalCode, '')
                    .replace(/\s/g, ' ').trim();

                let addressArr = addressData.Address.split(',');
                let newAddress = "";
                addressArr.map((value, index) => {
                    if (value.trim() !== "") {
                        newAddress += value;
                        if (index < addressArr.length) {
                            newAddress += ",";
                        }
                    }

                });

                if (newAddress.lastIndexOf(",") === newAddress.length - 1) {
                    newAddress = newAddress.substring(0, newAddress.length - 1);
                }
                newAddress = newAddress.trim();
                $('#postalcode').val(addressData.PostalCode);
                $('#address').val(newAddress);
                $('#state').val(addressData.State);
                return true;
            } else {
                return false;
            }
        },
        "Entered ZIP Code doesn't belong to entered State."
    );

    $.validator.addMethod(
        "checkSearchValue",
        function (value, element) {
            let checkState = false;
            let checkStateCode = false;
            let checkAddress = false;
            let checkPostCode = false;
            let valArray = value.replace(/\s/g, ',').split(',');
            $('#sendData').attr('disabled', true);

            if (value.length < 13) {
                errorMessage = "Please enter a valid address. A valid address should have at least 4 characters, followed by state name or code and 5 digit ZIP Code.";
                return false;
            } else {
                valArray.map((val, index) => {
                    if (val.length === 2 && isNaN(val) && !checkStateCode) {
                        checkStateCode = true;
                    } else if (val.length >= 4 && isNaN(val) && !checkAddress) {
                        checkAddress = true;
                    } else if (checkAddress && !checkState && isNaN(val)) {
                        checkState = true;
                    } else if (val.length === 5 && !isNaN(val)) {
                        checkPostCode = true;

                        if (element.dataset.live === "False") addressData.PostalCode = val;
                    }
                });
                if (!checkPostCode) {
                    errorMessage = "Please enter a 5 digit ZIP Code.";
                    return false;
                } else if (!checkAddress && !(checkState || checkStateCode) && checkPostCode) {
                    errorMessage = "You haven't entered an address or state.";
                    return false;
                } else if (!checkAddress || !(checkState || checkStateCode) || !checkPostCode) {
                    errorMessage = "You have entered an invalid address.";
                    return false;
                } else {
                    $('#sendData').removeAttr('disabled');

                    if (element.dataset.live === "False") {
                        addressData.Address = value;
                        if (value.includes("Illinois") || value.includes("IL")) {
                            addressData.State = "Illinois";
                            addressData.StateCode = "IL";
                        } else if (value.includes("Georgia") || value.includes("GA")) {
                            addressData.State = "Georgia";
                            addressData.StateCode = "GA";
                        } else if (value.includes("Wisconsin") || value.includes("WI")) {
                            addressData.State = "Wisconsin";
                            addressData.StateCode = "WI";
                        }
                    }
                    return true;
                }
            }
        },
        function () {
            return errorMessage;
        }
    );
});


let keyCount = 0, setCount = 0;
$(document).on('keyup focus click', '#addressSearch', function () {
    if (this.dataset.live === "True") {
        let textVal = this.value.replace(/\n/g, "");
        let geocoder = new google.maps.Geocoder();
        if (textVal.length >= 4) {
            geocoder.geocode({ 'address': textVal }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    let address_components = results[0].address_components;
                    addressData.Address = results[0].formatted_address;

                    for (let i = 0; i < address_components.length; i++) {
                        let component = address_components[i];
                        let addressType = component.types[0];

                        switch (addressType) {
                            case 'street_number':
                                addressData.StreetNumber = component.long_name;
                                break;
                            case 'route':
                                addressData.Route = component.short_name;
                                break;
                            case 'locality':
                                addressData.City = component.long_name;
                                break;
                            case 'administrative_area_level_1':
                                addressData.State = component.long_name;
                                addressData.StateCode = component.short_name;
                                break;
                            case 'postal_code':
                                addressData.PostalCode = component.long_name;
                                break;
                            case 'country':
                                addressData.Country = component.long_name;
                                break;
                        }
                    }
                }
            });
        }
    }

    setTimeout(setDropdown, 250);
    keyCount++;
});

function placeChanged() {
    let address_text = $('#addressSearch').val();
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address_text }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            let address_components = results[0].address_components;
            for (let i = 0; i < address_components.length; i++) {
                let component = address_components[i];
                let addressType = component.types[0];
                if (addressType === 'postal_code') {
                    if (!address_text.includes(component.long_name)) {
                        $('#addressSearch').val(address_text + " " + component.long_name);
                        $('#addressSearch').trigger('focus');
                        $('#AdressSearchForm').validate().element("#addressSearch");
                    }
                }
            }
        }
    });
}

function setDropdown() {
    if (keyCount === ++setCount) {
        let pac_items = $('.pac-item');
        pac_items.map((index, pac) => {
            let address_text = "";
            let hasZipCode = false;

            $(pac.children).map((i, e) => {
                if (!$(e).hasClass('pac-icon')) {
                    address_text += e.textContent + " ";
                } else if ($(e).hasClass('zip-code')) {
                    hasZipCode = true;
                }
            });

            if (!hasZipCode) {
                let geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': address_text }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        let address_components = results[0].address_components;
                        for (let i = 0; i < address_components.length; i++) {
                            let component = address_components[i];
                            let addressType = component.types[0];
                            if (addressType === 'postal_code') {
                                if (!address_text.includes(component.long_name)) {
                                    let span = $("<span>");
                                    $(span).addClass('zip-code').append(" " + component.long_name);
                                    $(pac).append(span);
                                }
                            }
                        }
                    }
                });
            }
        });
    }
}