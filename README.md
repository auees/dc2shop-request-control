
# Ubuntu XFCE Kiosk Mode Setup with Docker and Git

This guide will help you set up a new user on Ubuntu XFCE that logs in automatically without a password, runs in kiosk mode, and automatically launches Firefox in kiosk mode with the URL `http://0.0.0.0:3000` after Docker has started. Additionally, it includes steps to install Docker, Docker Compose, and Git, and to clone and deploy a repository.

## Prerequisites

Ensure that you have sudo privileges on the system.

## 1. Install Docker

Install Docker on your system:

```sh
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

Verify Docker installation:

```sh
docker --version
```

## 2. Install Docker Compose

Install Docker Compose on your system:

```sh
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Verify Docker Compose installation:

```sh
docker-compose --version
```

## 3. Install Git

Install Git on your system if it is not already installed:

```sh
sudo apt-get install -y git
```

Verify Git installation:

```sh
git --version
```

## 4. Clone the Repository

Clone the repository using Git:

```sh
git clone https://github.com/auees/dc2shop-request-control.git
cd dc2shop-request-control
```

## 5. Deploy the Application with Docker Compose

Deploy the application using Docker Compose:

```sh
sudo docker-compose up -d
```

Verify that the application is running:

```sh
sudo docker-compose ps
```

## 6. Create a New User

Create a new user named `kiosk`:

```sh
sudo adduser kiosk
```

Follow the prompts to set a password for the new user.

## 7. Enable Automatic Login for the New User

Edit the LightDM configuration file to enable automatic login for the `kiosk` user:

```sh
sudo nano /etc/lightdm/lightdm.conf
```

Add the following lines at the end of the file:

```ini
[Seat:*]
autologin-user=kiosk
autologin-user-timeout=0
```

## 8. Install `wmctrl`

Install the `wmctrl` package to manage windows:

```sh
sudo apt-get install wmctrl
```

## 9. Configure XFCE for Kiosk Mode

Create a `.xinitrc` file in the home directory of the `kiosk` user to start XFCE:

```sh
sudo -u kiosk nano /home/kiosk/.xinitrc
```

Add the following line to the file:

```sh
#!/bin/bash
exec startxfce4
```

## 10. Disable Screensaver and Automatic Screen Lock

Create a `.xsession` file to disable screensaver and automatic screen lock:

```sh
sudo -u kiosk nano /home/kiosk/.xsession
```

Add the following lines to the file:

```sh
#!/bin/bash
xset s off
xset -dpms
xset s noblank
xfce4-power-manager --no-daemon &
```

### 11. XFCE Power Management Settings

Configure XFCE power management settings to prevent the screen from turning off:

```sh
# Install xfce4-power-manager if it's not already installed
sudo apt-get install xfce4-power-manager

# Disable display sleep
xfconf-query -c xfce4-power-manager -p /xfce4-power-manager/blank-on-ac -s 0
xfconf-query -c xfce4-power-manager -p /xfce4-power-manager/dpms-enabled -s false
xfconf-query -c xfce4-power-manager -p /xfce4-power-manager/brightness-on-ac -s 100
xfconf-query -c xfce4-power-manager -p /xfce4-power-manager/dpms-on-ac-sleep -s 0
xfconf-query -c xfce4-power-manager -p /xfce4-power-manager/dpms-on-ac-off -s 0
```

## 12. Create a Systemd Service to Launch Firefox after Docker

Create a systemd service file to launch Firefox in kiosk mode after Docker has started:

```sh
sudo nano /etc/systemd/system/firefox-kiosk.service
```

Add the following content to the file:

```ini
[Unit]
Description=Start Firefox in kiosk mode after Docker is up
After=docker.service

[Service]
User=kiosk
Environment=DISPLAY=:0
ExecStart=/bin/bash -c 'firefox --kiosk http://0.0.0.0:3000 & sleep 5; wmctrl -a Firefox'

[Install]
WantedBy=default.target
```

## 13. Reload Systemd and Enable the Service

Reload systemd to apply the new service and enable it:

```sh
sudo systemctl daemon-reload
sudo systemctl enable firefox-kiosk.service
sudo systemctl start firefox-kiosk.service
```

## 14. Set Permissions

Ensure that all created files and directories have the correct permissions:

```sh
sudo chown -R kiosk:kiosk /home/kiosk
sudo chmod +x /home/kiosk/.xinitrc
sudo chmod +x /home/kiosk/.xsession
```

## 15. Reboot the System

Reboot the system to apply all changes:

```sh
sudo reboot
```

## Summary

After following these steps, the `kiosk` user will log in automatically upon system start, and Firefox will launch in kiosk mode pointing to `http://0.0.0.0:3000` after Docker has started. The screensaver and automatic screen lock will be disabled, ensuring uninterrupted usage.
