# Network Packet Analyzer - Task 05

## Prodigy InfoTech Cyber Security Internship

### Objective
Develop a network packet analyzer that captures and analyzes network packets and displays information such as source IP addresses, destination IP addresses, protocols, and payload data.

### Features
- Reads network packet captures
- Displays source IP addresses
- Displays destination IP addresses
- Identifies TCP and UDP protocols
- Displays available payload data
- Shows the total number of packets analyzed
- Uses a self-generated sample packet capture

### Technologies Used
- Python
- Scapy
- Google Colab

### How It Works
The program uses Scapy to create a sample packet capture and then reads the packets from the PCAP file.

For each packet, the analyzer extracts:
- Source IP
- Destination IP
- Protocol
- Payload data

### How to Run
1. Open the notebook in Google Colab.
2. Install and import Scapy.
3. Run the sample packet generation code.
4. Read the generated PCAP file.
5. Run the packet analysis code.
6. View the packet details and summary.

### Sample Output

```text
--- Packet 1 ---
Source IP      : 192.168.1.10
Destination IP : 192.168.1.20
Protocol       : TCP
Payload        : HTTP Request

--- Packet 2 ---
Source IP      : 192.168.1.20
Destination IP : 192.168.1.10
Protocol       : UDP
Payload        : DNS Response
