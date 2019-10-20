using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace AddressSearch.Models {
    public class AddressModel {
        public string PostalCode { get; set; }
        public string Address { get; set; }
        public string State { get; set; }
    }
}