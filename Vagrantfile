# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "trusty64"

  config.vm.define "edge" do |edge|
    edge.vm.hostname = "edge-server"
    edge.vm.network "private_network", ip: "10.11.11.10"
    edge.vm.network "forwarded_port", guest: 3000, host: 3000
    edge.vm.network "forwarded_port", guest: 3001, host: 3001
    edge.vm.network "forwarded_port", guest: 5672, host: 5672

    edge.vm.provision "shell", path: "setup.sh", privileged: false
    edge.vm.provision "shell", path: "start-edge.sh", run: "always", privileged: false
  end

  config.vm.define "internal" do |internal|
    internal.vm.hostname = "internal-server"
    internal.vm.network "private_network", ip: "10.11.11.11"
    internal.vm.network "forwarded_port", guest: 3100, host: 3100

    internal.vm.provision "shell", path: "setup.sh", privileged: false
    internal.vm.provision "shell", path: "start-internal.sh", run: "always", privileged: false
  end

end
