----------------------------------------------------------------------------------------
1. digitalocean ubuntu MEAN
https://www.digitalocean.com/community/tutorials/how-to-use-the-mean-one-click-install-image

mongoNodeChatPong 104.131.6.162 Active 512MB Ram 20GB SSD Disk New York 3 Ubuntu MEAN on 14.04

    ssh root@104.131.6.162

    cd /opt/mean
    grunt

It will now be available at

http://104.131.6.162:3700

WORKS!!! so far...
----------------------------------------------------------------------------------------
2. Remove that built in mena project

    cd /opt
    rm -rf mean

----------------------------------------------------------------------------------------
2. making demo user
  https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-12-04

    ssh root@104.131.6.162
    passwd
    adduser demo
    visudo             # or     File Name to Write: /etc/sudoers.tmp


# User privilege specification
  root    ALL=(ALL:ALL) ALL
  demo    ALL=(ALL:ALL) ALL
# Type ‘cntrl x’ to exit the file.
# Press Y to save; press enter, and the file will save in the proper place.

vi /etc/ssh/sshd_config
  Port 25000
  Protocol 2
  PermitRootLogin no
# at bottom put:
  UseDNS no
  AllowUsers demo
:wq

    reload ssh

----------------------------------------------------------------------------------------
3. Cloning my project

    ssh -p 25000 demo@104.131.6.162
    cd /opt/
    sudo apt-get update
    sudo apt-get install git
    git clone https://github.com/un5t0ppab13/pongchat.git;
    cd ~/opt/pongchat; ls;
    npm update
    npm install
    node pong.js &        # or similarly...    NODE_ENV=production PORT=80 grunt
  # fuck yeah 104.131.6.162:3700/
  # open it in 2 different browsers… or wait until next player joins

----------------------------------------------------------------------------------------
* = optional steps

*5. running

# if opened with & check jobs

    jobs

----------------------------------------------------------------------------------------
*6. init script to avoid closing server when I close the terminal

    # rc.local     # run scripts at start/boot

    cd /etc/init.d/
    sudo cp rc.local rc.local.old
    sudo vi rc.local

    # add a script at the bottom call mystart
    mystart &
    mystart2 &
    :w!q

  sudo touch mystart; sudo chmod +x /etc/init.d/mystart; sudo vi mystart;


  #!/bin/sh
  cd /opt/pongchat;
  node pong.js &

  :wq

  ./mystart

  If you can see this now you are looking good
  http://104.131.6.162:3700/

  may want to move the startup script somewhere better and/or add it to the path in ~/.bashrc

----------------------------------------------------------------------------------------
*7. check mongo is configured and running

    ps aux | grep mongo

    mongod
    mongo

----------------------------------------------------------------------------------------
*8. add front end ...

    bower install -g
    grunt server








Most improved pong version

Socket.io - Binding the front and back-end together with Node.js and Canvas
==========================================================================================

**Socket.IO aims to make realtime apps possible in every browser and mobile device, blurring the differences between the different transport mechanisms.**

Socket.io: HTML5's websockets live-chats, realtime collaboration applications, and multi-player games possible.

Simple 2-player game (that everyone should recognize) using Socket.io to handle our data.  It'll feature simple match making and (obviously) realtime play. Node.js will be handling our backend data and the visuals will be handled with HTML5's Canvas.

_**Open /presentation/index.html to view the slides. To run the demo, in the root directory call "node pong" in the command line and direct your browser to localhost:3700**

_**To see the presentation live, visit me on [Youtube](http://www.youtube.com/watch?v=qmvxytWVBJ4)!**_