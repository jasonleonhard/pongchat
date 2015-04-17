# Node Development Server
# https://github.com/alexwitherspoon/bearcrud
FROM debian:wheezy

# Network Ports Used by App
EXPOSE 8080
EXPOSE 22

# Commands to Stage OS
RUN echo "Updating OS" && \
    bash -c "apt-get update -qq" && \
    bash -c "apt-get upgrade -qq --force-yes" && \
    bash -c "apt-get autoremove -qq --force-yes" && \
    bash -c "apt-get clean -qq --force-yes" && \
    echo "OS Updated, installing software" && \
    echo "...."

RUN echo "Installing Base Utilties" && \
    bash -c "apt-get update -qq" && \
    bash -c "apt-get install -qq --force-yes build-essential nano ssh" && \
    bash -c "echo 'root:bearcrud' | chpasswd" && \
    bash -c "apt-get autoremove -qq --force-yes" && \
    bash -c "apt-get clean -qq --force-yes" && \
    echo "Base Utilities Installed" && \
    echo "...."

# Commands to Stage App
RUN echo "Installing git" && \
    bash -c "apt-get install -qq --force-yes git" && \
    bash -c "apt-get autoremove -qq --force-yes" && \
    bash -c "apt-get clean -qq --force-yes" && \
    echo "git Installed" && \
    echo "...."
    
RUN echo "Installing mongodb" && \
    bash -c "apt-get install -qq --force-yes mongodb" && \
    bash -c "apt-get autoremove -qq --force-yes" && \
    bash -c "apt-get clean -qq --force-yes" && \
    echo "mongodb Installed" && \
    echo "...."

RUN echo "Installing node.js" && \
    bash -c "apt-get install -qq --force-yes curl" && \
    bash -c "curl -sL https://deb.nodesource.com/setup | bash -" && \
    bash -c "apt-get install -qq --force-yes nodejs" && \
    bash -c "npm cache clean -f" && \
    bash -c "npm install -g n" && \
    bash -c "n stable" && \
    bash -c "apt-get autoremove -qq --force-yes" && \
    bash -c "apt-get clean -qq --force-yes" && \
    echo "node.js Installed" && \
    echo "...."
    
#RUN echo "Installing Bearcrud App" && \
#    bash -c "cd /opt" && \
#    bash -c "git clone https://github.com/alexwitherspoon/bearcrud.git /opt/bearcrud" && \
#    bash -c "cd /opt/bearcrud && npm install" && \
#    echo "BearCrud Installed" && \
#    echo "...."
    
# Commands to Run App
#CMD bash -c "/etc/init.d/ssh start" && \
#    bash -c "/etc/init.d/mongodb start" && \
#    bash -c "node /opt/bearcrud/server.js"

RUN echo "Installing pongchat app" && \
    bash -c "cd /opt" && \
    bash -c "git clone https://github.com/un5t0ppab13/pongchat.git /opt/pongchat" && \
    bash -c "cd /opt/pongchat && npm install" && \
    echo "Pongchat Installed" && \
    echo "...."

# Commands to Run App
CMD bash -c "/etc/init.d/ssh start" && \
    bash -c "/etc/init.d/mongodb start" && \
    bash -c "node /opt/pongchat/server.js"
