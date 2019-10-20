using AddressSearch.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AddressSearch.Controllers {
    public class HomeController : Controller {
        [HttpGet]
        [Route]
        public ActionResult Index() {
            return View();
        }

        [HttpGet]
        [Route("ofline-search")]
        public ActionResult OflineSearch() {
            return View();
        }

        [HttpGet]
        [Route("live-search")]
        public ActionResult LiveSearch() {
            return View();
        }

        [HttpGet]
        [Route("example-addresses")]
        public ActionResult ExampleAddresses() {
            return View();
        }

        [HttpPost]
        [Route("your-address")]
        public ActionResult YourAddress(AddressModel addressModel) {
            return View(addressModel);
        }
    }
}