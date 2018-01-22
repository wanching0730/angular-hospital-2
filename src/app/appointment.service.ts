import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Doctor } from 'app/doctor';
import { error } from 'util';
import { UUID } from 'angular2-uuid';
import { Appointment } from 'app/appointment';

@Injectable()
export class AppointmentService {

  appColRef: AngularFirestoreCollection<Appointment>;
  appDoc: AngularFirestoreDocument<Appointment>;
  appointment: Appointment;
  userId: string;  

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) { 
    
    this.appColRef = this.afs.collection('appointments');

    afAuth.authState.subscribe( user => {
      if(user){
        this.userId = user.uid;
      }
    })

  }

  addAppointment(appointment : Appointment){
    this.afAuth.authState.subscribe( user => {
      if(user){
        this.userId = user.uid;
      }
    })

    appointment.id = UUID.UUID();
    appointment.hospital_id = this.userId;

    this.appDoc = this.afs.doc<Appointment>(`appointments/${appointment.id}`);

    this.appDoc.update(appointment).then(() => {
      console.log('updated successfully');
    }).catch((error) => {
      this.appDoc.set(appointment);
      console.log('added successfully');
    })
  }

  editAppointment(appointment: Appointment, id: string){

    appointment.id = id;
    appointment.hospital_id = this.userId;

    this.appDoc = this.afs.doc<Appointment>(`appointments/${id}`);
    this.appDoc.update(appointment).then(() => {
      console.log('updated successfully');
    }).catch((error => {
      this.appDoc.set(appointment);
      console.log(error);
    }))

  }

  deleteAppointment(id: string) {
    console.log('appointment to be deleted: ' + id);
    this.appDoc = this.afs.doc<Appointment>(`appointments/${id}`);
    this.appDoc.delete().then(() => {
      console.log('appointment deleted successfully');
    })
    
  }

  getAppointment(appId: string){

    this.appColRef = this.afs.collection('appointments');
    this.appColRef.ref.where('id', '==', appId).get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log('doc.id: ' + doc.id, '=>', doc.data());

        this.appointment = {
          id : doc.get('id'),
          description: doc.get('description'),
          patient_id: doc.get('patient_id'),
          doctor_id: doc.get('doctor_id'),
          hospital_id: doc.get('hospital_id'),
          date: doc.get('date'),
          time : doc.get('time')
        };

      });
    }).catch(error => {
      console.log(error);
    })

    return this.appointment;

  }

}
