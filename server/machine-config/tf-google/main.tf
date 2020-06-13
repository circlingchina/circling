variable "num_instances" {
  default = 1
}

provider "google" {
  version = "3.5.0"

  credentials = file("~/.circling-api/circling-sa-key.json")

  project = "circling-deploy"
  region  = "us-west1"
  zone    = "us-west1-b"
}

resource "google_compute_network" "vpc_network" {
  name = "circling-api-network"
}

resource "google_compute_firewall" "default" {
  name    = "circling-firewall"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443"]
  }
}

resource "google_compute_address" "static" {
  name = "ipv4-circling-api-${count.index+1}"
  count = var.num_instances
}

resource "google_compute_instance" "vm_instance" {
  count        = var.num_instances
  name         = "circling-api-${count.index+1}"
  machine_type = "e2-micro"
  allow_stopping_for_update = true
  boot_disk {
    initialize_params {
      image = "ubuntu-1804-bionic-v20200610"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      nat_ip = google_compute_address.static[count.index].address
    }
  }

}
