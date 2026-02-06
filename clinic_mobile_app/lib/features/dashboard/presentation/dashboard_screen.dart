import 'package:flutter/material.dart';
import '../../patients/presentation/patient_list_screen.dart';
import '../../appointments/presentation/appointments_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Dashboard'),
            Text(
              'Welcome, Dr. Smith', 
              style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 12)
            ),
          ],
        ),
        actions: [
          IconButton(icon: Icon(Icons.notifications_outlined), onPressed: () {}),
          CircleAvatar(
            backgroundColor: Colors.blue.shade100,
            child: Text('DS'),
          ),
          SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Grid
            GridView.count(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.5,
              children: [
                _buildStatCard(context, 'Total Patients', '1,240', Icons.people_outline, Colors.blue),
                _buildStatCard(context, 'Appointments', '12', Icons.calendar_today_outlined, Colors.orange),
                _buildStatCard(context, 'Pending Reports', '5', Icons.assignment_outlined, Colors.red),
                _buildStatCard(context, 'Income (Today)', '\$850', Icons.attach_money, Colors.green),
              ],
            ),
            SizedBox(height: 24),
            Text('Quick Actions', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildQuickAction(context, 'Add Patient', Icons.person_add_outlined, () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => PatientListScreen()));
                }),
                _buildQuickAction(context, 'Schedule', Icons.add_alarm, () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => AppointmentsScreen()));
                }),
                _buildQuickAction(context, 'Symptom Check', Icons.medical_services_outlined, () {}),
                _buildQuickAction(context, 'QR Scan', Icons.qr_code_scanner, () {}),
              ],
            ),
            SizedBox(height: 24),
            Text('Today\'s Appointments', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            ListView.separated(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: 3,
              separatorBuilder: (_, __) => SizedBox(height: 12),
              itemBuilder: (context, index) {
                return _buildAppointmentCard(context);
              },
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Patients'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'Schedule'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Settings'),
        ],
        currentIndex: 0,
        onTap: (idx) {
           if (idx == 1) Navigator.push(context, MaterialPageRoute(builder: (context) => PatientListScreen()));
           if (idx == 2) Navigator.push(context, MaterialPageRoute(builder: (context) => AppointmentsScreen()));
        },
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: color, size: 30),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, String label, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Theme.of(context).primaryColor),
          ),
          SizedBox(height: 8),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildAppointmentCard(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.purple.shade50,
          child: Text('JD', style: TextStyle(color: Colors.purple)),
        ),
        title: Text('John Doe'),
        subtitle: Text('General Checkup • 10:30 AM'),
        trailing: Container(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.green.shade50,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text('Confirmed', style: TextStyle(color: Colors.green, fontSize: 12)),
        ),
      ),
    );
  }
}
