import 'package:flutter/material.dart';

class PatientListScreen extends StatelessWidget {
  const PatientListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Patients'),
        actions: [
          IconButton(icon: Icon(Icons.search), onPressed: () {}),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: Icon(Icons.add),
      ),
      body: ListView.separated(
        padding: EdgeInsets.all(16),
        itemCount: 10,
        separatorBuilder: (_, __) => SizedBox(height: 12),
        itemBuilder: (context, index) {
          return Card(
            margin: EdgeInsets.zero,
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: index % 2 == 0 ? Colors.blue.shade100 : Colors.pink.shade100,
                child: Text('P${index + 1}'),
              ),
              title: Text('Patient Name ${index + 1}'),
              subtitle: Text('ID: PAT-2023-${1000 + index}'),
              trailing: Icon(Icons.chevron_right),
              onTap: () {
                // Navigate to details
              },
            ),
          );
        },
      ),
    );
  }
}
