import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { format, parse } from 'date-fns';  // Import date-fns for date and time formatting

interface Appointment {
  _id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  public appointmentData: Appointment[] = [];
  isModalOpen = false;
  isEdit = false;
  selectedAppointment: Appointment = {
    _id: 0,
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'Scheduled', // Default status for new appointments
  };

  // Define status options for dropdown
  statusOptions: string[] = ['Scheduled', 'Completed', 'Cancelled'];
  searchQuery: string = ''; // Track search query
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  pageSize = 5; // Adjust as per your backend's default limit

  // Define totalPagesArray to generate pagination links
  totalPagesArray: number[] = [];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.canAccess();
    if (this.auth.isAuthenticated()) {
      this.fetchAppointmentData();
    }
  }

  fetchAppointmentData() {
    const page = this.currentPage; // Current page number
    const limit = this.pageSize; // Limit per page

    this.auth.detail(page, limit).subscribe({
      next: (data: any) => {
        this.appointmentData = data.appointments;
        this.totalItems = data.totalItems;
        this.totalPages = data.totalPages;

        // Generate totalPagesArray based on totalPages
        this.totalPagesArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
      },
      error: (error) => {
        console.error('Error fetching appointments:', error);
        // Handle error as needed
      },
    });
  }

  onPageChange(pageNumber: number) {
    this.currentPage = pageNumber;
    this.fetchAppointmentData();
  }
  
  searchAppointments() {
    if (this.searchQuery.trim() !== '') {
      this.auth.searchAppointments(this.searchQuery).subscribe({
        next: (data: any) => {
          this.appointmentData = data.appointments;
        },
        error: (error) => {
          console.error('Error searching appointments:', error);
        },
      });
    } else {
      // If search query is empty, fetch all appointments
      this.fetchAppointmentData();
    }
  }

  openCreateModal() {
    this.isEdit = false;
    
    // Get current date in yyyy-MM-dd format
    const currentDate = new Date();
    this.selectedAppointment.date = format(currentDate, 'yyyy-MM-dd');
    
    // Get current time in HH:mm format
    const currentTime = format(currentDate, 'HH:mm');
    this.selectedAppointment.startTime = currentTime;
    
    // Calculate end time as one hour ahead of start time
    const oneHourLater = new Date(currentDate.getTime() + (60 * 60 * 1000)); // Adding one hour
    this.selectedAppointment.endTime = format(oneHourLater, 'HH:mm');
    
    this.selectedAppointment.status = 'Scheduled'; // Set default status
    
    this.isModalOpen = true;
  }

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    return format(parsedDate, 'yyyy-MM-dd');
  }

  openEditModal(appointment: Appointment) {
    this.isEdit = true;
    // Make a deep copy of the appointment object to prevent reference issues
    this.selectedAppointment = { ...appointment };
    this.selectedAppointment.date = this.formatDate(this.selectedAppointment.date)
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedAppointment = {
      _id: 0,
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      status: 'Scheduled', // Reset status to 'Scheduled' for new appointments
    };
  }

  formatTime(time: string): string {
    const parsedTime = parse(time, 'HH:mm', new Date());
    return format(parsedTime, 'hh:mm a');  // Format time with AM/PM
  }

  createOrUpdateAppointment() {
    if (this.isEdit) {
      this.updateAppointment();
    } else {
      this.createAppointment();
    }
  }

  createAppointment() {
    // Ensure status is 'Scheduled' for new appointments
    this.selectedAppointment.status = 'Scheduled';
    this.auth.createAppointment(this.selectedAppointment).subscribe({
      next: () => {
        console.log('Appointment created successfully');
        this.fetchAppointmentData(); // Fetch updated list after creating
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating appointment:', error);
        // Handle error as needed
      },
    });
  }

  updateAppointment() {
    this.auth.updateAppointment(this.selectedAppointment).subscribe({
      next: () => {
        console.log('Appointment updated successfully');
        this.fetchAppointmentData(); // Fetch updated list after updating
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating appointment:', error);
        // Handle error as needed
      },
    });
  }

  deleteAppointment(appointment: Appointment) {
    this.auth.deleteAppointment(appointment._id).subscribe({
      next: () => {
        console.log('Appointment deleted successfully');
        this.fetchAppointmentData(); // Fetch updated list after deleting
      },
      error: (error) => {
        console.error('Error deleting appointment:', error);
        // Handle error as needed
      },
    });
  }
}
