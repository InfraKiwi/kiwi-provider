# This script runs in a chroot to prepare the root file system for running as a microVM (mostly cosmetics)

echo "Setting login credentials"
echo "root:root" | chpasswd

echo "Setting hostname"
echo "microvm" > /etc/hostname

echo "Enabling DHCP"
echo "auto eth0" > /etc/network/interfaces.d/eth0
echo "iface eth0 inet dhcp" >> /etc/network/interfaces.d/eth0

# idk, i think real getty worked better? todo: more checks here
systemctl mask serial-getty@hvc0.service

# from dockerfile
# Autologin, prevent systemd from half-clearing the tty, hide login messages, properly stop (reboot) system on logout
mkdir -p /etc/systemd/system/getty@hvc0.service.d/

unit="/etc/systemd/system/getty@hvc0.service.d/override.conf"
echo "Unit: $unit"
echo "[Service]" > $unit
echo "ExecStart=" >> $unit
echo "ExecStart=-/sbin/agetty --login-options '-f -- \\u' --noclear --autologin root --noissue --nonewline --nohostname %I $TERM" >> $unit
#echo "ExecStart=-/sbin/agetty --noclear --autologin root --noissue --nonewline --nohostname %I $TERM" >> $unit
echo "TTYVTDisallocate=no" >> $unit
echo "ExecStop=/bin/systemctl reboot" >> $unit

# This doesn't seem necessary until it does
systemctl enable getty@hvc0

# niceties

# Quiet login
# Hushlogin is outdated, PAM does it now
sed -i -r 's/(.*(pam_lastlog|pam_mail|motd\.dynamic).*)/# \1/' /etc/pam.d/login
rm -f /etc/motd