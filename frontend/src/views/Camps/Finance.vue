<template>
  <div>
    <!-- Camp Selector -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-7">
            <label class="form-label fw-semibold">
              <i class="fas fa-campground me-1 text-primary"></i> Select Camp
            </label>
            <select class="form-select form-select-lg" v-model="selectedCampId" @change="onCampChange">
              <option v-if="!camps.length" value="0">No camps created yet</option>
              <option v-for="camp in camps" :key="camp.id" :value="camp.id">
                {{ camp.title }} — {{ formatDate(camp.camp_date) }} ({{ camp.status }})
              </option>
            </select>
          </div>
          <div class="col-md-5">
            <div class="d-flex gap-2 justify-content-md-end">
              <router-link :to="{ name: 'CampRegister', query: { camp_id: selectedCampId } }" class="btn btn-outline-secondary">
                <i class="fas fa-clipboard-list me-1"></i> Register
              </router-link>
              <div class="btn-group">
                <button class="btn btn-outline-success dropdown-toggle" data-bs-toggle="dropdown" :disabled="!camps.length">
                  <i class="fas fa-file-export me-1"></i> Export
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="exportFinance('xlsx', 'summary')">
                      <i class="fas fa-file-excel me-2 text-success"></i> Full report (.xlsx)
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="exportFinance('csv', 'contributions')">
                      <i class="fas fa-file-csv me-2 text-primary"></i> Donations (CSV)
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="exportFinance('csv', 'expenses')">
                      <i class="fas fa-file-csv me-2 text-primary"></i> Expenses (CSV)
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!camps.length" class="card">
      <div class="card-body">
        <div class="empty-state py-5 text-center">
          <i class="fas fa-campground d-block mb-3" style="font-size:2.5rem;"></i>
          <h5>No blood camps yet</h5>
          <p class="text-secondary mb-3">Create a camp first, then you can track its donations and expenses.</p>
          <router-link to="/camps" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Create a Camp
          </router-link>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Money Summary -->
      <div class="row g-3 mb-3">
        <div class="col-6 col-lg-2">
          <div class="stat-card bg-total">
            <i class="fas fa-wallet stat-icon"></i>
            <div class="stat-value">{{ formatMoney(summary.budget) }}</div>
            <div class="stat-label">Budget</div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="stat-card bg-o-pos">
            <i class="fas fa-hand-holding-dollar stat-icon"></i>
            <div class="stat-value">{{ formatMoney(summary.cash_received) }}</div>
            <div class="stat-label">Cash Donated</div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="stat-card bg-messages">
            <i class="fas fa-bottle-water stat-icon"></i>
            <div class="stat-value">{{ formatMoney(summary.inkind_value) }}</div>
            <div class="stat-label">Goods Value</div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="stat-card bg-a-pos">
            <i class="fas fa-receipt stat-icon"></i>
            <div class="stat-value">{{ formatMoney(summary.expenses_paid) }}</div>
            <div class="stat-label">Spent</div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="stat-card bg-eligible">
            <i class="fas fa-hourglass-half stat-icon"></i>
            <div class="stat-value">{{ formatMoney(summary.expenses_planned) }}</div>
            <div class="stat-label">Still to Pay</div>
          </div>
        </div>
        <div class="col-6 col-lg-2">
          <div class="stat-card bg-b-pos">
            <i class="fas fa-scale-balanced stat-icon"></i>
            <div class="stat-value">{{ formatMoney(summary.balance) }}</div>
            <div class="stat-label">Balance</div>
          </div>
        </div>
      </div>

      <!-- Budget Planner -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-4">
              <label class="form-label fw-semibold">
                <i class="fas fa-bullseye me-1 text-primary"></i> Planned Budget for this Camp
              </label>
              <div class="input-group">
                <span class="input-group-text">Rs.</span>
                <input type="number" class="form-control" v-model="budgetInput" step="0.01" min="0" placeholder="e.g. 25000">
                <button class="btn btn-primary" @click="saveBudget">
                  <i class="fas fa-save me-1"></i> Save
                </button>
              </div>
              <div class="form-text">Leave blank to clear the budget.</div>
            </div>
            <div class="col-md-8">
              <div class="d-flex justify-content-between mb-1">
                <span class="fw-semibold">{{ budgetBarLabel }}</span>
                <span class="text-secondary small">{{ budgetBarNumbers }}</span>
              </div>
              <div class="progress" style="height:14px;">
                <div class="progress-bar bg-danger" role="progressbar" :style="{ width: budgetBarPaidWidth + '%' }"></div>
                <div class="progress-bar bg-warning" role="progressbar" :style="{ width: budgetBarPlannedWidth + '%' }"></div>
              </div>
              <div class="d-flex gap-3 mt-2 small text-secondary">
                <span><i class="fas fa-square text-danger me-1"></i> Paid</span>
                <span><i class="fas fa-square text-warning me-1"></i> Committed, not yet paid</span>
                <span v-if="isOverBudget" class="text-danger fw-semibold">
                  <i class="fas fa-triangle-exclamation me-1"></i> Over budget
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-pills mb-3" role="tablist">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'donations' }" @click="activeTab = 'donations'">
            <i class="fas fa-hand-holding-heart me-1"></i> Donations Received
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'expenses' }" @click="activeTab = 'expenses'">
            <i class="fas fa-receipt me-1"></i> Expenses
          </button>
        </li>
      </ul>

      <div class="tab-content">
        <!-- DONATIONS TAB -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'donations' }">
          
          <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="fas fa-boxes-stacked me-2 text-primary"></i> What Came In</span>
              <span class="text-secondary small">{{ summary.contributors }} contributor(s) · {{ summary.inkind_items }} item(s)</span>
            </div>
            <div class="card-body">
              <div class="row g-2">
                <div v-if="!contribBreakdown.length" class="col-12 text-secondary small">
                  Nothing recorded yet. Use <strong>Record a Donation</strong> to add the food, drinks and water people bring.
                </div>
                <div v-for="cat in contribBreakdown" :key="cat.category" class="col-6 col-md-4 col-xl-3">
                  <div class="border rounded p-2 h-100">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <i :class="['fas', catIcon(cat.category), 'text-primary']"></i>
                      <span class="fw-semibold">{{ cat.category }}</span>
                    </div>
                    <div class="small text-secondary">
                      {{ cat.entries }} entry(ies)
                      <span v-if="cat.quantity > 0"> · {{ formatNum(cat.quantity) }} units</span>
                    </div>
                    <div class="small fw-semibold">
                      {{ cat.total > 0 ? formatMoney(cat.total) : 'value not estimated' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <div>
              <button class="btn btn-primary" @click="openContribModal(null)">
                <i class="fas fa-plus me-1"></i> Record a Donation
              </button>
            </div>
            <div class="d-flex gap-2">
              <select class="form-select form-select-sm" v-model="filterContribCategory" @change="fetchContributions" style="min-width:150px;">
                <option value="">All categories</option>
                <option v-for="cat in contribCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <select class="form-select form-select-sm" v-model="filterContribStatus" @change="fetchContributions" style="min-width:140px;">
                <option value="">All</option>
                <option value="Received">Received</option>
                <option value="Pledged">Pledged</option>
              </select>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover" style="width:100%">
                  <thead>
                    <tr>
                      <th>Donated By</th>
                      <th>Category</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingContribs"><td colspan="8" class="text-center">Loading...</td></tr>
                    <tr v-else-if="!contributions.length"><td colspan="8" class="text-center">No donations recorded.</td></tr>
                    <tr v-for="c in contributions" :key="c.id">
                      <td>
                        <span class="fw-semibold">{{ c.contributor_name }}</span>
                        <br v-if="c.mobile"><span v-if="c.mobile" class="text-secondary small">{{ c.mobile }}</span>
                      </td>
                      <td>
                        <i :class="['fas', catIcon(c.category), 'me-1', 'text-primary']"></i> {{ c.category }}
                      </td>
                      <td>
                        {{ c.item_name || '—' }}
                        <br v-if="c.remarks"><span v-if="c.remarks" class="text-secondary small">{{ c.remarks }}</span>
                      </td>
                      <td>{{ c.quantity != null ? formatNum(c.quantity) + (c.unit ? ' ' + c.unit : '') : '—' }}</td>
                      <td>
                        <span v-if="c.amount != null">
                          {{ formatMoney(c.amount) }}
                          <span v-if="c.category !== 'Cash'" class="text-secondary small">(est.)</span>
                        </span>
                        <span v-else class="text-secondary">—</span>
                      </td>
                      <td><span :class="['badge-status', c.status.toLowerCase()]">{{ c.status }}</span></td>
                      <td>{{ formatDate(c.received_date) }}</td>
                      <td>
                        <div class="d-flex gap-1">
                          <button class="btn btn-icon btn-outline-primary" @click="openContribModal(c)" title="Edit">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-icon btn-outline-danger" @click="deleteContrib(c.id)" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        <!-- EXPENSES TAB -->
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'expenses' }">
          
          <div class="row g-3 mb-3">
            <div class="col-lg-5">
              <div class="card h-100">
                <div class="card-header">
                  <i class="fas fa-chart-pie me-2 text-primary"></i> Spending by Category
                </div>
                <div class="card-body">
                  <div v-if="expenseBreakdown.length" style="position:relative;height:260px;">
                    <Doughnut :data="chartData" :options="chartOptions" />
                  </div>
                  <div v-else class="empty-state py-3">
                    <i class="fas fa-chart-pie d-block"></i>
                    <p class="mb-0 mt-2">No expenses recorded yet</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-7">
              <div class="card h-100">
                <div class="card-header">
                  <i class="fas fa-list-ul me-2 text-primary"></i> Category Totals
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-sm mb-0">
                      <tbody>
                        <tr v-if="!expenseBreakdown.length">
                          <td class="text-secondary">Nothing recorded yet.</td>
                        </tr>
                        <tr v-for="(cat, index) in expenseBreakdown" :key="cat.category">
                          <td>
                            <i class="fas fa-circle me-2" :style="{ color: chartColors[index % chartColors.length] }"></i>
                            {{ cat.category }}
                          </td>
                          <td class="text-end fw-semibold">{{ formatMoney(cat.total) }}</td>
                          <td class="text-end text-secondary small">{{ Math.round((cat.total / summary.expenses_total) * 100) }}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <div>
              <button class="btn btn-primary" @click="openExpenseModal(null)">
                <i class="fas fa-plus me-1"></i> Add Expense
              </button>
            </div>
            <div class="d-flex gap-2">
              <select class="form-select form-select-sm" v-model="filterExpenseCategory" @change="fetchExpenses" style="min-width:150px;">
                <option value="">All categories</option>
                <option v-for="cat in expenseCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <select class="form-select form-select-sm" v-model="filterExpenseStatus" @change="fetchExpenses" style="min-width:140px;">
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Planned">Planned</option>
              </select>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover" style="width:100%">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Paid To</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingExpenses"><td colspan="7" class="text-center">Loading...</td></tr>
                    <tr v-else-if="!expenses.length"><td colspan="7" class="text-center">No expenses recorded.</td></tr>
                    <tr v-for="e in expenses" :key="e.id">
                      <td>{{ formatDate(e.expense_date) }}</td>
                      <td>{{ e.category }}</td>
                      <td>
                        {{ e.description }}
                        <br v-if="e.remarks"><span v-if="e.remarks" class="text-secondary small">{{ e.remarks }}</span>
                      </td>
                      <td>{{ e.paid_to || '—' }}</td>
                      <td>{{ formatMoney(e.amount) }}</td>
                      <td><span :class="['badge-status', e.status.toLowerCase()]">{{ e.status }}</span></td>
                      <td>
                        <div class="d-flex gap-1">
                          <button class="btn btn-icon btn-outline-primary" @click="openExpenseModal(e)" title="Edit">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-icon btn-outline-danger" @click="deleteExpense(e.id)" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>

    <!-- Contribution Modal -->
    <div class="modal fade" id="contribModal" tabindex="-1" ref="contribModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-hand-holding-heart me-2 text-primary"></i> 
              {{ contribForm.id ? 'Edit Donation' : 'Record a Donation' }}
            </h5>
            <button type="button" class="btn-close" @click="closeContribModal"></button>
          </div>
          <form @submit.prevent="saveContrib">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-7">
                  <label class="form-label">Donated By <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="contribForm.contributor_name" required placeholder="Name of the person, shop or organisation">
                </div>
                <div class="col-md-5">
                  <label class="form-label">T.P. Number</label>
                  <input type="text" class="form-control" v-model="contribForm.mobile" inputmode="numeric" placeholder="0771234567 (optional)">
                </div>
                <div class="col-md-4">
                  <label class="form-label">What Was Donated <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="contribForm.category" required>
                    <option v-for="cat in contribCategories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
                <div class="col-md-8">
                  <label class="form-label">Item <span class="text-danger" v-if="contribForm.category !== 'Cash'">*</span></label>
                  <input type="text" class="form-control" v-model="contribForm.item_name" :required="contribForm.category !== 'Cash'" placeholder="e.g. Water bottles (500ml), Milk rice packets">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Quantity</label>
                  <input type="number" class="form-control" v-model="contribForm.quantity" step="0.01" min="0" placeholder="100">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Unit</label>
                  <input type="text" class="form-control" v-model="contribForm.unit" list="unitOptions" placeholder="bottles">
                  <datalist id="unitOptions">
                    <option value="bottles"></option>
                    <option value="packets"></option>
                    <option value="boxes"></option>
                    <option value="cases"></option>
                    <option value="trays"></option>
                    <option value="kg"></option>
                    <option value="litres"></option>
                    <option value="pieces"></option>
                  </datalist>
                </div>
                <div class="col-md-3">
                  <label class="form-label">{{ contribForm.category === 'Cash' ? 'Amount' : 'Estimated Value' }}</label>
                  <div class="input-group">
                    <span class="input-group-text">Rs.</span>
                    <input type="number" class="form-control" v-model="contribForm.amount" step="0.01" min="0" placeholder="0.00" :required="contribForm.category === 'Cash'">
                  </div>
                  <div class="form-text" v-if="contribForm.category !== 'Cash'">Roughly what it was worth — optional.</div>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="contribForm.status">
                    <option value="Received">Received</option>
                    <option value="Pledged">Pledged (promised)</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-control" v-model="contribForm.received_date">
                </div>
                <div class="col-12">
                  <label class="form-label">Remarks</label>
                  <textarea class="form-control" v-model="contribForm.remarks" rows="2" placeholder="Anything worth noting..."></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="closeContribModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="savingContrib">
                <i class="fas fa-save me-1"></i> {{ savingContrib ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Expense Modal -->
    <div class="modal fade" id="expenseModal" tabindex="-1" ref="expenseModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-receipt me-2 text-primary"></i> 
              {{ expenseForm.id ? 'Edit Expense' : 'Add Expense' }}
            </h5>
            <button type="button" class="btn-close" @click="closeExpenseModal"></button>
          </div>
          <form @submit.prevent="saveExpense">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Description <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="expenseForm.description" required placeholder="e.g. Lunch packets for volunteers">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Category</label>
                  <select class="form-select" v-model="expenseForm.category">
                    <option v-for="cat in expenseCategories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Amount <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">Rs.</span>
                    <input type="number" class="form-control" v-model="expenseForm.amount" step="0.01" min="0" required placeholder="0.00">
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Paid To</label>
                  <input type="text" class="form-control" v-model="expenseForm.paid_to" placeholder="Shop or person">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-control" v-model="expenseForm.expense_date">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Payment Method</label>
                  <select class="form-select" v-model="expenseForm.payment_method">
                    <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="expenseForm.status">
                    <option value="Paid">Paid</option>
                    <option value="Planned">Planned (not yet paid)</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Receipt No</label>
                  <input type="text" class="form-control" v-model="expenseForm.receipt_no" placeholder="Optional">
                </div>
                <div class="col-12">
                  <label class="form-label">Remarks</label>
                  <textarea class="form-control" v-model="expenseForm.remarks" rows="2"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="closeExpenseModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="savingExpense">
                <i class="fas fa-save me-1"></i> {{ savingExpense ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios'
import Swal from 'sweetalert2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const route = useRoute()
const camps = ref([])
const selectedCampId = ref(0)
const budgetInput = ref('')

const activeTab = ref('donations')

const summary = reactive({
  budget: 0,
  cash_received: 0,
  inkind_value: 0,
  expenses_paid: 0,
  expenses_planned: 0,
  expenses_total: 0,
  balance: 0,
  contributors: 0,
  inkind_items: 0
})

const contribBreakdown = ref([])
const expenseBreakdown = ref([])

const contributions = ref([])
const expenses = ref([])

const loadingContribs = ref(false)
const loadingExpenses = ref(false)

const filterContribCategory = ref('')
const filterContribStatus = ref('')

const filterExpenseCategory = ref('')
const filterExpenseStatus = ref('')

const contribCategories = [
  'Cash', 'Food', 'Water & Beverages', 'Medical Supplies', 'Venue/Facilities',
  'Transport', 'Gifts/Tokens', 'Other'
]
const expenseCategories = [
  'Food & Refreshments', 'Medical Supplies', 'Venue Hire', 'Transport',
  'Marketing & Print', 'Gifts/Tokens', 'Other'
]
const paymentMethods = ['Cash', 'Bank Transfer', 'Cheque', 'Other']

const chartColors = [
  '#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#06b6d4',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#64748b'
]

const chartData = computed(() => {
  return {
    labels: expenseBreakdown.value.map(e => e.category),
    datasets: [{
      data: expenseBreakdown.value.map(e => e.total),
      backgroundColor: chartColors,
      borderWidth: 0,
      hoverOffset: 4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { boxWidth: 12 } }
  }
}

// Modals
const contribModalRef = ref(null)
let contribModalInstance = null
const savingContrib = ref(false)
const contribForm = reactive({
  id: 0,
  camp_id: 0,
  contributor_name: '',
  mobile: '',
  category: 'Food',
  item_name: '',
  quantity: '',
  unit: '',
  amount: '',
  status: 'Received',
  received_date: '',
  remarks: ''
})

const expenseModalRef = ref(null)
let expenseModalInstance = null
const savingExpense = ref(false)
const expenseForm = reactive({
  id: 0,
  camp_id: 0,
  description: '',
  category: 'Food & Refreshments',
  amount: '',
  paid_to: '',
  expense_date: '',
  payment_method: 'Cash',
  status: 'Paid',
  receipt_no: '',
  remarks: ''
})

onMounted(async () => {
  if (window.bootstrap) {
    if (contribModalRef.value) contribModalInstance = new window.bootstrap.Modal(contribModalRef.value)
    if (expenseModalRef.value) expenseModalInstance = new window.bootstrap.Modal(expenseModalRef.value)
  }
  
  await fetchCamps()
  if (camps.value.length > 0) {
    const queryCampId = parseInt(route.query.camp_id)
    if (queryCampId && camps.value.some(c => c.id === queryCampId)) {
      selectedCampId.value = queryCampId
    } else {
      selectedCampId.value = camps.value[0].id
    }
    onCampChange()
  }
})

const fetchCamps = async () => {
  try {
    const res = await api.post('/camps/list', {
      draw: 1, start: 0, length: 1000, order: [{ column: 1, dir: 'desc' }]
    })
    camps.value = res.data.data
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch camps', 'error')
  }
}

const onCampChange = () => {
  const camp = camps.value.find(c => c.id === selectedCampId.value)
  budgetInput.value = camp?.budget_amount || ''
  fetchContributions()
  fetchExpenses()
}

const saveBudget = async () => {
  if (!selectedCampId.value) return
  try {
    const res = await api.post('/camps/budget-save', {
      camp_id: selectedCampId.value,
      budget_amount: budgetInput.value
    })
    if (res.data.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Budget saved', showConfirmButton: false, timer: 3000 })
      const camp = camps.value.find(c => c.id === selectedCampId.value)
      if (camp) camp.budget_amount = budgetInput.value ? parseFloat(budgetInput.value) : null
      fetchContributions() // re-fetch summary
    } else {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to save budget', 'error')
  }
}

const updateSummary = (s) => {
  if (!s) return
  summary.budget = parseFloat(s.budget) || 0
  summary.cash_received = parseFloat(s.cash_received) || 0
  summary.inkind_value = parseFloat(s.inkind_value) || 0
  summary.expenses_paid = parseFloat(s.expenses_paid) || 0
  summary.expenses_planned = parseFloat(s.expenses_planned) || 0
  summary.expenses_total = summary.expenses_paid + summary.expenses_planned
  summary.balance = parseFloat(s.balance) || 0
  summary.contributors = s.contributors || 0
  summary.inkind_items = s.inkind_items || 0
}

const fetchContributions = async () => {
  if (!selectedCampId.value) return
  loadingContribs.value = true
  try {
    const res = await api.post('/finance/contributions/list', {
      draw: 1, start: 0, length: 1000,
      camp_id: selectedCampId.value,
      category: filterContribCategory.value,
      status: filterContribStatus.value,
      order: [{ column: 0, dir: 'desc' }]
    })
    contributions.value = res.data.data
    contribBreakdown.value = res.data.by_category || []
    updateSummary(res.data.summary)
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch contributions', 'error')
  } finally {
    loadingContribs.value = false
  }
}

const fetchExpenses = async () => {
  if (!selectedCampId.value) return
  loadingExpenses.value = true
  try {
    const res = await api.post('/finance/expenses/list', {
      draw: 1, start: 0, length: 1000,
      camp_id: selectedCampId.value,
      category: filterExpenseCategory.value,
      status: filterExpenseStatus.value,
      order: [{ column: 0, dir: 'desc' }]
    })
    expenses.value = res.data.data
    expenseBreakdown.value = res.data.by_category || []
    // The expenses endpoint also returns summary, update it to keep balance consistent
    if (res.data.summary) updateSummary(res.data.summary)
  } catch (error) {
    Swal.fire('Error', 'Failed to fetch expenses', 'error')
  } finally {
    loadingExpenses.value = false
  }
}

const budgetBarPaidWidth = computed(() => {
  const scale = summary.budget > 0 ? Math.max(summary.budget, summary.expenses_total) : summary.expenses_total
  return scale > 0 ? (summary.expenses_paid / scale) * 100 : 0
})

const budgetBarPlannedWidth = computed(() => {
  const scale = summary.budget > 0 ? Math.max(summary.budget, summary.expenses_total) : summary.expenses_total
  return scale > 0 ? (summary.expenses_planned / scale) * 100 : 0
})

const budgetBarLabel = computed(() => {
  if (summary.budget > 0) {
    return `${Math.round((summary.expenses_total / summary.budget) * 100)}% of budget committed`
  }
  return 'No budget set'
})

const budgetBarNumbers = computed(() => {
  if (summary.budget > 0) {
    return `${formatMoney(summary.expenses_total)} of ${formatMoney(summary.budget)}`
  }
  return `${formatMoney(summary.expenses_total)} spent so far`
})

const isOverBudget = computed(() => {
  return summary.budget > 0 && summary.expenses_total > summary.budget
})

// Modals
const openContribModal = (item) => {
  if (item) {
    Object.assign(contribForm, item)
  } else {
    Object.assign(contribForm, {
      id: 0,
      camp_id: selectedCampId.value,
      contributor_name: '',
      mobile: '',
      category: 'Food',
      item_name: '',
      quantity: '',
      unit: '',
      amount: '',
      status: 'Received',
      received_date: new Date().toISOString().slice(0,10),
      remarks: ''
    })
  }
  if (contribModalInstance) contribModalInstance.show()
}
const closeContribModal = () => { if (contribModalInstance) contribModalInstance.hide() }

const saveContrib = async () => {
  savingContrib.value = true
  contribForm.camp_id = selectedCampId.value
  try {
    const res = await api.post('/finance/contributions/save', contribForm)
    if (res.data.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 })
      closeContribModal()
      fetchContributions()
    } else {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to save', 'error')
  } finally {
    savingContrib.value = false
  }
}

const deleteContrib = async (id) => {
  const result = await Swal.fire({ title: 'Delete Donation?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete', confirmButtonColor: '#dc3545' })
  if (result.isConfirmed) {
    try {
      const res = await api.post('/finance/contributions/delete', { id })
      if (res.data.success) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 })
        fetchContributions()
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
      }
    } catch (error) { Swal.fire('Error', 'Failed to delete', 'error') }
  }
}

const openExpenseModal = (item) => {
  if (item) {
    Object.assign(expenseForm, item)
  } else {
    Object.assign(expenseForm, {
      id: 0,
      camp_id: selectedCampId.value,
      description: '',
      category: 'Food & Refreshments',
      amount: '',
      paid_to: '',
      expense_date: new Date().toISOString().slice(0,10),
      payment_method: 'Cash',
      status: 'Paid',
      receipt_no: '',
      remarks: ''
    })
  }
  if (expenseModalInstance) expenseModalInstance.show()
}
const closeExpenseModal = () => { if (expenseModalInstance) expenseModalInstance.hide() }

const saveExpense = async () => {
  savingExpense.value = true
  expenseForm.camp_id = selectedCampId.value
  try {
    const res = await api.post('/finance/expenses/save', expenseForm)
    if (res.data.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 })
      closeExpenseModal()
      fetchExpenses()
    } else {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to save', 'error')
  } finally {
    savingExpense.value = false
  }
}

const deleteExpense = async (id) => {
  const result = await Swal.fire({ title: 'Delete Expense?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete', confirmButtonColor: '#dc3545' })
  if (result.isConfirmed) {
    try {
      const res = await api.post('/finance/expenses/delete', { id })
      if (res.data.success) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 3000 })
        fetchExpenses()
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: res.data.message, showConfirmButton: false, timer: 3000 })
      }
    } catch (error) { Swal.fire('Error', 'Failed to delete', 'error') }
  }
}

const exportFinance = (format, section) => {
  if (!selectedCampId.value) return
  const params = new URLSearchParams({ camp_id: selectedCampId.value, format, section })
  window.location.href = `/api/finance/export?${params.toString()}`
}

const formatMoney = (val) => {
  const num = parseFloat(val) || 0
  return `Rs. ${num.toLocaleString('en-US', { minimumFractionDigits: num % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`
}

const formatNum = (val) => {
  const num = parseFloat(val) || 0
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const catIcon = (cat) => {
  const icons = {
    'Cash': 'fa-money-bill-wave',
    'Food': 'fa-bowl-food',
    'Water & Beverages': 'fa-bottle-water',
    'Medical Supplies': 'fa-kit-medical',
    'Venue/Facilities': 'fa-building',
    'Transport': 'fa-truck',
    'Gifts/Tokens': 'fa-gift',
    'Other': 'fa-box'
  }
  return icons[cat] || 'fa-box'
}
</script>
